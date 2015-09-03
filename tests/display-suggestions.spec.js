
    var hogan = require('hogan.js'),
        _ = require('lodash'),
        Promise = require('bluebird'),
        faker = require('faker')
        ;

    describeComponent(require('lib'), function() {
        var query = faker.lorem.words(faker.random.number({min: 1, max: 1})).join(' '),
            suggestions = [
                {id: 1, name: query + ' was here'},
                    {id: 1, name: query + ' is here'},
                        {id: 1, name: query + ' will be here'}
            ]
            ;

    beforeEach(function() {
        this.setupComponent(
            [
                '<div>',
                    '<input type="text" />',
                    '<aside></aside>',
                    '<p></p>',
                '</div>'
            ].join(''),{
                minLength: 3,
                events: {
                    uiGetSuggestions: 'uiGetSuggestions',
                        dataSuggestions: 'dataSuggestions'
                },
                templates: {
                    suggestions: (function(tmpl) {
                            return tmpl.render.bind(tmpl);
                        })(hogan.compile([
                            '<ul>',
                            '{{#suggestions}}',
                                '<li data-id="{{id}}" data-label="{{name}}">{{name}}</li>',
                            '{{/suggestions}}',
                            '</ul>'].join(''))),
                    hint: function(suggestion) { return suggestion.name; }
                }
            }
        );
    });

    describe('on keyup event', function() {
        var uiGetSuggestionsEventSpy
            ;

        beforeEach(function() {
            uiGetSuggestionsEventSpy = spyOnEvent(this.$node, 'uiGetSuggestions');
        });

        afterEach(function() {
            uiGetSuggestionsEventSpy.reset();
        });

        describe('valid length', function() {
            beforeEach(function() {
                this.component.select('inputSelector')
                    .val(query)
                    .trigger('keyup')
                    ;
            });

            it('should trigger uiGetSuggestions', function(done) {
                setTimeout(function() {
                    expect('uiGetSuggestions').toHaveBeenTriggeredOnAndWith(this.$node, [query]);
                    done();
                })
            });
        });

        describe('minLength', function() {
            beforeEach(function() {
                this.component.select('inputSelector')
                    .val(query.substr(0,2))
                    .trigger('keyup')
                    ;
            });

            it('should not trigger uiGetSuggestions', function() {
                expect('uiGetSuggestions').not.toHaveBeenTriggeredOn(this.$node);
            });
        });
    });

    describe('on dataSuggestions event', function() {

        beforeEach(function() {
            this.component.trigger('dataSuggestions', [suggestions]);
        });

        it('should populate list of suggestions', function() {
            expect(this.component.select('listSelector')).toHaveClass('active');
            expect(this.component.select('suggestionsSelector')).toHaveLength(suggestions.length);
        });

        it('should display hint', function() {
            expect(this.component.select('hintSelector')).toContainText(suggestions[0].name);
        });

        describe('[ESC] (keyCode 27)', function() {
            beforeEach(function() {
                this.component.select('inputSelector').trigger($.Event('keyup', { keyCode: 27 }));
            });

            it('should hide deactivate suggestions', function() {
                expect(this.component.select('listSelector')).not.toHaveClass('active');
                expect(this.component.select('suggestionsSelector')).toHaveLength(0);
            });

            it('should clear hint', function() {
                expect(this.component.select('hintSelector')).toBeEmpty();
            });
        });
    });

    describe('when user deletes text', function() {
        beforeEach(function() {
            this.component.trigger('dataSuggestions', [suggestions]);

            this.component.select('inputSelector')
                .val(query.substr(0,2))
                .trigger('keyup')
                ;
        });

        it('should hide deactivate suggestions', function() {
            expect(this.component.select('listSelector')).not.toHaveClass('active');
            expect(this.component.select('suggestionsSelector')).toHaveLength(0);
        });

        it('should clear hint', function() {
            expect(this.component.select('hintSelector')).toBeEmpty();
        });

        it('should clear hint', function() {
            expect('uiGetSuggestions').not.toHaveBeenTriggeredOn(this.$node);
        });
    });

    describe('[ARROW UP] (keyCode 38)', function() {
        var that
            ;

        beforeEach(function() {
            that = this;

            this.component.select('inputSelector')
                .val(query)
                .trigger('keyup');
        });

        beforeEach(function() {
            this.component.trigger('dataSuggestions', [suggestions]);
        });

        function triggerArrowUpKey() {
            that.component.select('inputSelector').trigger($.Event('keydown', {keyCode: 38}));
        }

        it('should move to the previous suggestions', function(done) {
            (function(suggestions) {
                suggestions.reverse();
                return suggestions;
            })(_.clone(suggestions))
                .reduce(function(after, suggestion) {
                    return after.then(function() {
                        return new Promise(function(resolve) {
                            triggerArrowUpKey();
                            setTimeout(function() {
                                expect(that.component.select('inputSelector')).toHaveValue(suggestion.name);
                                expect(that.component.select('hintSelector')).toBeEmpty();
                                resolve();
                            });
                        });
                    });
                }, new Promise(function(resolve) { resolve() }))
                .then(done)
                .catch(done)
                ;
        });

        describe('no more previous', function() {
            beforeEach(function() {
                _.range(suggestions.length+1).forEach(triggerArrowUpKey);
            });

            it('should move to the original input value when no more previous', function() {
                expect(that.component.select('inputSelector')).toHaveValue(query);
                expect(that.component.select('hintSelector')).toContainText(suggestions[0].name);
            });
        });

        describe('[ENTER] (keyCode XX)', function() {
            beforeEach(function() {
                that = this;
                this.component.select('inputSelector')
                    .val(query)
                    .trigger('keydown');

                this.component.trigger('dataSuggestions', [suggestions]);
            });

            describe('when no suggestion is selected', function() {
                it('should not prevent default behaviour');
            });

            describe('when suggestion is selected', function() {
                it('should prevent default behaviour');
                it('should trigger uiSelectedSuggestion');
            });
        });
    });

    describe('[ARROW DOWN] (keyCode 40)', function() {
        var that;

        beforeEach(function() {
            that = this;

            this.component.select('inputSelector')
                .val(query)
                .trigger('keyup');
        });

        beforeEach(function() {
            this.component.trigger('dataSuggestions', [suggestions]);
        });

        function triggerArrowDownKey() {
            that.component.select('inputSelector').trigger($.Event('keydown', {keyCode: 40}));
        }

        it('should move to the next suggestions', function(done) {
            suggestions.reduce(function(after, suggestion) {
                return after.then(function() {
                    return new Promise(function(resolve) {
                        triggerArrowDownKey();
                        setTimeout(function() {
                            expect(that.component.select('inputSelector')).toHaveValue(suggestion.name);
                            expect(that.component.select('hintSelector')).toBeEmpty();
                            resolve();
                        });
                    });
                });
            }, new Promise(function(resolve) { resolve() }))
            .then(done)
            .catch(done)
            ;
        });

        it('should move to the original input value when no more next', function() {
            _.range(suggestions.length+1).forEach(triggerArrowDownKey);
            expect(that.component.select('inputSelector')).toHaveValue(query);
            expect(that.component.select('hintSelector')).toContainText(suggestions[0].name);
        });
    });

    describe('hints', function() {
        beforeEach(function() {
            this.component.select('inputSelector')
                .val(query + ' is')
                .trigger('keyup');
        });

        beforeEach(function() {
            this.component.trigger('dataSuggestions', [suggestions]);
        });

        it('should display hint', function() {
            expect(this.component.select('hintSelector')).toContainText(suggestions[1].name);
        });
    });
});

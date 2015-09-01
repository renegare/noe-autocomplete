
    var hogan = require('hogan.js'),
        _ = require('lodash'),
        Promise = require('bluebird'),
        faker = require('faker')
        ;

    describeComponent(require('lib'), function() {
        var query = faker.lorem.words(faker.random.number({min: 1, max: 3})).join(' '),
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
                events: {
                    uiGetSuggestions: 'uiGetSuggestions',
                        dataSuggestions: 'dataSuggestions'
                },
                templates: {
                    suggestions: (function(tmpl) {
                            return tmpl.render.bind(tmpl);
                        })(hogan.compile([
                            '{{#suggestions}}',
                                '<div data-id="{{id}}" data-label="{{name}}">{{name}}</div>',
                            '{{/suggestions}}'].join(''))),
                    hint: function(suggestion) { return suggestion.name; }
                }
            }
        );
    });

    describe('on keydown', function() {
        beforeEach(function() {
            spyOnEvent(document, 'uiGetSuggestions');

            this.component.select('inputSelector')
                .val(query)
                .trigger('keyup')
                ;
        });

        it('should trigger uiGetSuggestions', function() {
            expect('uiGetSuggestions').toHaveBeenTriggeredOnAndWith(document, [query]);
        });
    });

    describe('on dataSuggestions', function() {

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
});

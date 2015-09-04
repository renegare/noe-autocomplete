

describeComponent(require('lib'), function() {
    var query = faker.lorem.words(faker.random.number({min: 1, max: 1})).join(' '),
        uiGetSuggestionsEventSpy,
        suggestions = [
            {id: 1, name: query + ' was here'},
                {id: 1, name: query + ' is here'},
                    {id: 1, name: query + ' will be here'}
        ]
        ;

    function setInputValue(query) {
        return function(done) {
            this.component.select('inputSelector')
                .trigger('keydown')
                .val(query)
                ;
            setTimeout(done, 20);
        };
    };

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
                        })(Hogan.compile([
                            '<ul>',
                            '{{#suggestions}}',
                                '<li data-id="{{id}}" data-label="{{name}}">{{name}}</li>',
                            '{{/suggestions}}',
                            '</ul>'].join(''))),
                    hint: function(view) { return view.hint; }
                }
            }
        );
    });

    beforeEach(function() {
        uiGetSuggestionsEventSpy = spyOnEvent(this.$node, 'uiGetSuggestions');
    });

    afterEach(function() {
        uiGetSuggestionsEventSpy.reset();
    });

    describe('on keyup event', function() {

        describe('with valid length string', function() {
            beforeEach(setInputValue(query));

            it('should trigger uiGetSuggestions', function(done) {
                setTimeout(function() {
                    expect('uiGetSuggestions').toHaveBeenTriggeredOnAndWith(this.$node, [query]);
                    done();
                }.bind(this), 100)
            });
        });

        describe('minLength', function() {
            beforeEach(setInputValue(query.substr(0,2)));

            it('should not trigger uiGetSuggestions', function() {
                expect('uiGetSuggestions').not.toHaveBeenTriggeredOn(this.$node);
            });
        });
    });

    describe('on dataSuggestions event', function() {
        beforeEach(setInputValue(query));

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
        });
    });

    describe('when user deletes text', function() {
        beforeEach(function() {
            this.component.trigger('dataSuggestions', [suggestions]);
        });

        beforeEach(setInputValue(query.substr(0,2)));

        it('should hide deactivate suggestions', function() {
            expect(this.component.select('listSelector')).not.toHaveClass('active');
            expect(this.component.select('suggestionsSelector')).toHaveLength(0);
        });

        it('should clear hint', function() {
            expect(this.component.select('hintSelector')).toBeEmpty();
        });

        it('should not trigger uiGetSuggestions', function() {
            expect('uiGetSuggestions').not.toHaveBeenTriggeredOn(this.$node);
        });
    });

    describe('[ARROW UP] (keyCode 38)', function() {
        var that
            ;

        beforeEach(function() {
            that = this;
        });

        beforeEach(setInputValue(query));

        beforeEach(function() {
            this.component.trigger('dataSuggestions', [suggestions]);
        });

        function triggerArrowUpKey() {
            that.component.select('inputSelector').trigger($.Event('keyup', {keyCode: 38}));
        }

        it('should move to the previous suggestion', function(done) {
            (function(suggestions) {
                suggestions.reverse();
                return suggestions;
            })(_.clone(suggestions))
                .reduce(function(after, suggestion) {
                    return after.then(function() {
                        return new Promise(function(resolve) {
                            triggerArrowUpKey();
                            setTimeout(function() {
                                var indx = suggestions.indexOf(suggestion);
                                expect(that.component.select('suggestionsSelector').eq(indx)).toHaveClass('active');
                                expect(that.component.select('suggestionsSelector').eq(indx).siblings('.active')).toHaveLength(0);
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

            it('should not have any suggestion marked as active', function() {
                expect(that.component.select('suggestionsSelector').filter('.active')).toHaveLength(0);
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
        });

        beforeEach(setInputValue(query));

        beforeEach(function() {
            this.component.trigger('dataSuggestions', [suggestions]);
        });

        function triggerArrowDownKey() {
            that.component.select('inputSelector').trigger($.Event('keyup', {keyCode: 40}));
        }

        it('should move to the next suggestions', function(done) {
            suggestions.reduce(function(after, suggestion) {
                return after.then(function() {
                    return new Promise(function(resolve) {
                        triggerArrowDownKey();
                        setTimeout(function() {
                            var indx = suggestions.indexOf(suggestion);
                            expect(that.component.select('suggestionsSelector').eq(indx)).toHaveClass('active');
                            expect(that.component.select('suggestionsSelector').eq(indx).siblings('.active')).toHaveLength(0);
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
                _.range(suggestions.length+1).forEach(triggerArrowDownKey);
            });

            it('should move to the original input value when no more next', function() {
                expect(that.component.select('inputSelector')).toHaveValue(query);
                expect(that.component.select('hintSelector')).toContainText(suggestions[0].name);
            });

            it('should not have any suggestion marked as active', function() {
                expect(that.component.select('suggestionsSelector').filter('.active')).toHaveLength(0);
            });
        });
    });

    describe('hints', function() {
        var mixedCaseQuery = query.split('')
                .map(function(char) {
                    return char[Math.random() >= 0.5? 'toUpperCase' : 'toLowerCase']();
                })
                .join('') + ' iS',
            expectedHint = mixedCaseQuery + suggestions[1].name.substr(mixedCaseQuery.length)
            ;

        beforeEach(setInputValue(mixedCaseQuery));

        beforeEach(function() {
            this.component.trigger('dataSuggestions', [suggestions]);
        });

        it('should display hint', function() {
            expect(this.component.select('hintSelector')).toContainText(expectedHint);
        });
    });
});

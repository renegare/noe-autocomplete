'use strict';

describeComponent(require('lib'), function() {
    var query = faker.lorem.words(faker.random.number({min: 1, max: 1})).join(' '),
        uiGetSuggestionsEventSpy,
        uiMatchedSuggestionSpy,
        uiSelectedSuggestionSpy,
        suggestions = [
            {id: 1, name: query + ' was here'},
                {id: 1, name: query + ' is here'},
                    {id: 1, name: query + ' will be here'}
        ],
        $input
        ;

    function setInputValue(query) {
        return function(done) {
            this.component.select('inputSelector')
                .trigger('keypress')
                .val(query)
                ;
            setTimeout(done, 50);
        };
    };

    beforeEach(function() {
        this.setupComponent(
            [
                '<div>',
                    '<input type="text" />',
                    '<small></small>',
                    '<aside></aside>',
                '</div>'
            ].join(''),{
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

        $input = this.component.select('inputSelector');
    });

    beforeEach(function() {
        uiGetSuggestionsEventSpy = spyOnEvent(this.$node, 'uiGetSuggestions');
        uiSelectedSuggestionSpy = spyOnEvent(this.$node, 'uiSelectedSuggestion');
        uiMatchedSuggestionSpy = spyOnEvent(this.$node, 'uiMatchedSuggestion');
    });

    afterEach(function() {
        uiGetSuggestionsEventSpy.reset();
        uiSelectedSuggestionSpy.reset();
        uiMatchedSuggestionSpy.reset();
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

        describe('on uiClose', function() {
            beforeEach(function() {
                this.$node.trigger('uiClose');
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
    });

    describe('[ARROW DOWN] (keyCode 40)', function() {
        var that;

        beforeEach(setInputValue(query));

        beforeEach(function() {
            this.component.trigger('dataSuggestions', [suggestions]);
            that = this;
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


    describe('[ENTER] (keyCode 13)', function() {
        var spyEvent, $input
            ;
        beforeEach(setInputValue(query));

        beforeEach(function() {
            $input = this.component.select('inputSelector');
            spyEvent = spyOnEvent($input, 'keydown');
        });

        describe('has no suggestions', function() {
            beforeEach(function() {
                $input.trigger($.Event('keydown', {keyCode: 13}));
            });

            it('should not prevent default behaviour and event bubbling', function() {
                expect('keydown').not.toHaveBeenStoppedOn($input);
                expect('keydown').not.toHaveBeenPreventedOn($input);
            });
        });

        describe('has suggestions', function() {
            beforeEach(function() {
                this.component.trigger('dataSuggestions', [suggestions]);
            });

            describe('non selected', function() {
                beforeEach(function() {
                    $input.trigger($.Event('keydown', {keyCode: 13}));
                });

                it('should not prevent default behaviour and event bubbling', function() {
                    expect('keydown').not.toHaveBeenStoppedOn($input);
                    expect('keydown').not.toHaveBeenPreventedOn($input);
                });
            });

            describe('non selected but matches a suggestion', function() {
                beforeEach(setInputValue(suggestions[0].name));

                beforeEach(function() {
                    $input.trigger($.Event('keydown', {keyCode: 13}));
                });

                it('should prevent default behaviour', function() {
                    expect('keydown').toHaveBeenStoppedOn($input);
                    expect('keydown').toHaveBeenPreventedOn($input);
                });

                it('should trigger uiMatchedSuggestion', function() {
                    expect('uiMatchedSuggestion').toHaveBeenTriggeredOnAndWith(this.$node, [suggestions[0]]);
                });
            });

            describe('selected', function() {
                beforeEach(function() { // select first section
                    $input.trigger($.Event('keyup', {keyCode: 40}));
                });

                beforeEach(function() {
                    expect($input).toHaveValue(suggestions[0].name);
                    $input.trigger($.Event('keydown', {keyCode: 13}));
                });

                it('should prevent default behaviour', function() {
                    expect('keydown').toHaveBeenStoppedOn($input);
                    expect('keydown').toHaveBeenPreventedOn($input);
                });

                it('should trigger uiSelectedSuggestion', function() {
                    expect('uiSelectedSuggestion').toHaveBeenTriggeredOnAndWith(this.$node, [suggestions[0]]);
                });
            });

            describe('selected and then unselected', function() {
                beforeEach(function() { // select first section
                    $input.trigger($.Event('keyup', {keyCode: 40}));
                });

                beforeEach(function() { // unselect
                    expect($input).toHaveValue(suggestions[0].name);
                    $input.trigger($.Event('keyup', {keyCode: 38}));
                });

                beforeEach(function() {
                    expect($input).toHaveValue(query);
                    $input.trigger($.Event('keydown', {keyCode: 13}));
                });

                it('should prevent default behaviour', function() {
                    expect('keydown').not.toHaveBeenStoppedOn($input);
                    expect('keydown').not.toHaveBeenPreventedOn($input);
                });

                it('should not trigger uiSelectedSuggestion', function() {
                    expect('uiSelectedSuggestion').not.toHaveBeenTriggeredOn(this.$node);
                });
            });
        });
    });

    xdescribe('suggestions list mouse interactions', function() {
        beforeEach(setInputValue(query));

        beforeEach(function() {
            this.component.trigger('dataSuggestions', [suggestions]);
        });

        describe('hover', function() {
            beforeEach(function() {
                this.component.select('suggestionsSelector').eq(0).trigger('hover');
            });

            it('should highlight the suggestion', function() {
                expect(this.component.select('suggestionsSelector').eq(0)).toHaveClass('active');
            });
        });

        describe('click', function() {
            it('should select the clicked suggestion');
        });
    });

    describe('edge cases', function() {
        describe('deselecting suggestion but hitting enter on matching free text', function() {
            beforeEach(function() {
                this.component.trigger('dataSuggestions', [suggestions]);
            });

            beforeEach(setInputValue(suggestions[0].name));

            beforeEach(function() { // select first section
                $input.trigger($.Event('keyup', {keyCode: 40}));
            });

            beforeEach(setInputValue(suggestions[0].name));

            beforeEach(function() {
                this.component.select('inputSelector').trigger($.Event('keydown', {keyCode: 13}));
            });

            it('should trigger uiMatchedSuggestion', function() {
                expect('uiMatchedSuggestion').toHaveBeenTriggeredOnAndWith(this.$node, [suggestions[0]]);
            });

            it('should not trigger uiSelectedSuggestion', function() {
                expect('uiSelectedSuggestion').not.toHaveBeenTriggeredOn(this.$node);
            });
        });
    });
});

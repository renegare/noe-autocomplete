describe('suggestions', function() {
    var hogan = require('hogan.js'),
        _ = require('lodash')
        ;

    describeComponent(require('noe-autocomplete'), function() {
        var query = 'mudi'
            ;
        beforeEach(function() {
            spyOnEvent(document, 'uiGetSuggestions');

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
                        suggestion: (function(tmpl) {
                            return tmpl.render.bind(tmpl);
                        })(hogan.compile('<div data-id="{{suggestion.id}}" data-label="{{suggestion.name}}">{{suggestion.name}}</div>')),
                        hint: function(suggestion) {
                            return suggestion.name;
                        }
                    }
                }
            );
        });

        describe('on keydown', function() {
            beforeEach(function() {
                this.component.select('inputSelector')
                    .val(query)
                    .trigger('keydown')
                    ;
            });

            it('should trigger uiGetSuggestions', function() {
                expect('uiGetSuggestions').toHaveBeenTriggeredOnAndWith(document, query);
            });
        });

        describe('on dataSuggestions', function() {
            var suggestions = [
                    {id: 1, name: 'mudi was here'},
                        {id: 1, name: 'mudi is here'},
                            {id: 1, name: 'mudi will be here'}
                ]
                ;

            beforeEach(function() {
                this.component.trigger('dataSuggestions', [suggestions]);
            });

            it('should populate list of suggestions', function() {
                expect(this.component.select('listSelector')).toHaveClass('active');
                expect(this.component.select('suggestionsSelector')).toHaveLength(suggestions.length);
            });

            it('should display hint', function() {
                expect(this.component.select('hintSelector')).toContainText('mudi was here');
            });

            describe('arrow down key (40)', function() {
                var that;

                beforeEach(function() {
                    that = this;

                    this.component.select('inputSelector')
                        .val(query)
                        .trigger('keydown')
                });

                function triggerArrowDownKey() {
                    that.component.select('inputSelector').trigger($.Event('keydown', {keyCode: 40}));
                }

                suggestions.forEach(function(suggestion, n) {
                    it('should move to the next (' + n + ') suggestion', function() {
                        _.range(n+1).forEach(triggerArrowDownKey)
                        expect(that.component.select('inputSelector')).toHaveValue(suggestion.name);
                    });
                });

                it('should move to the original input value when no more next', function() {
                    _.range(suggestions.length+1).forEach(triggerArrowDownKey);
                    expect(that.component.select('inputSelector')).toHaveValue(query);
                });
            });

            describe('arrow up key (38)', function() {
                var that,
                    rSuggestions = _.clone(suggestions)
                    ;

                rSuggestions.reverse();

                beforeEach(function() {
                    that = this;

                    this.component.select('inputSelector')
                        .val(query)
                        .trigger('keydown')
                });

                function triggerArrowUpKey() {
                    that.component.select('inputSelector').trigger($.Event('keydown', {keyCode: 38}));
                }

                rSuggestions.forEach(function(suggestion, n) {
                    it('should move to the previous (' + n + ') suggestion', function() {
                        _.range(n+1).forEach(triggerArrowUpKey)
                        expect(that.component.select('inputSelector')).toHaveValue(suggestion.name);
                    });
                });

                it('should move to the original input value when no more previous', function() {
                    _.range(suggestions.length+1).forEach(triggerArrowUpKey);
                    expect(that.component.select('inputSelector')).toHaveValue(query);
                });
            });

            describe('on [ESC]', function() {
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
    });
});

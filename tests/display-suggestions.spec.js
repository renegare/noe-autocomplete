describe('suggestions', function() {
    var hogan = require('hogan.js')
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
                        })(hogan.compile('<div data-id="{{id}}">{{name}}</div>')),
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
            beforeEach(function() {
                this.component.trigger('dataSuggestions', [[
                    {id: 1, name: 'mudi was here'},
                        {id: 1, name: 'mudi is here'},
                            {id: 1, name: 'mudi will be here'}
                ]]);
            });

            it('should populate list of suggestions', function() {
                expect(this.component.select('listSelector')).toHaveClass('active');
                expect(this.component.select('suggestionsSelector')).toHaveLength(3);
            });

            it('should display hint', function() {
                expect(this.component.select('hintSelector')).toContainText('mudi was here');
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

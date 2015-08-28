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
                    '</div>'
                ].join(''),{
                    events: {
                        uiGetSuggestions: 'uiGetSuggestions',
                            dataSuggestions: 'dataSuggestions'
                    },
                    templates: {
                        suggestion: (function(tmpl) {
                            return tmpl.render.bind(tmpl);
                        })(hogan.compile('<li data-id="{{id}}">{{name}}</li>'))
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
                expect(this.component.select('suggestionsSelector')).toHaveClass('active');
                expect(this.component.select('suggestionsSelector').find('> *')).toHaveLength(3);
            });
        });
    });
});

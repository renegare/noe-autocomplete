var flight = require('flight')

module.exports = flight.component(NoeAutoComplete);

function noOp(){};

function NoeAutoComplete() {
    this.attributes({
        events: {},
        inputSelector: 'input[type=text]',
        suggestionsSelector: 'aside',
        templates: {}
    });

    this.after('initialize', function() {
        this.attr.events = $.extend({
            uiGetSuggestions: 'uiGetSuggestions',
            dataSuggestions: 'dataSuggestions'
        }, this.attr.events);

        this.attr.templates = $.extend({
            suggestion: noOp
        }, this.attr.templates);

        this.on('keydown', {
            inputSelector: function() {
                this.trigger(this.attr.events.uiGetSuggestions, [this.getValue()]);
            }
        });

        this.on(this.attr.events.dataSuggestions, this.populateList);
    });

    this.getValue = function() {
        return this.select('inputSelector').val();
    }

    this.populateList = function(e, suggestions) {
        this.select('suggestionsSelector').addClass('active');

        this.select('suggestionsSelector')
            .addClass('active')
            .html($.map(suggestions, function(suggestion) {
                return this.attr.templates.suggestion({suggestion: suggestion});
            }.bind(this)));
    }
}

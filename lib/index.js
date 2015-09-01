var flight = require('flight')

module.exports = flight.component(NoeAutocomplete);

function noOp(){};

function NoeAutocomplete() {
    this.attributes({
        events: {},
        inputSelector: 'input[type=text]',
        listSelector: 'aside',
        suggestionsSelector: 'aside div',
        hintSelector: 'p',
        templates: {}
    });

    this.after('initialize', function() {
        this.suggestions = [];
        this.suggestionIndex = -1;

        this.attr.events = $.extend({
            uiGetSuggestions: 'uiGetSuggestions',
            dataSuggestions: 'dataSuggestions'
        }, this.attr.events);

        this.attr.templates = $.extend({
            suggestion: noOp,
            hint: noOp
        }, this.attr.templates);

        this.on('keyup', {
            inputSelector: function(e) {
                if(e.keyCode === 27) {
                    this.clear();
                } else if(this.query !== this.getValue()) {
                    e.preventDefault();
                    this.getSuggestions();
                }
            }
        });

        this.on('keydown', {
            inputSelector: function(e) {
                if(e.keyCode === 38) {
                    this.highlightPreviousSuggestion();
                } else if(e.keyCode === 40) {
                    this.highlightNextSuggestion();
                }

            }
        });

        this.on(this.attr.events.dataSuggestions, function(e, suggestions) {
            this.update(suggestions);
        });
    });

    this.getSuggestions = function() {
        this.query = this.getValue();
        this.trigger(this.attr.events.uiGetSuggestions, [this.query]);
    };

    this.highlightPreviousSuggestion = function() {
        var label
            ;

        this.suggestionIndex = this.suggestionIndex > -1? this.suggestionIndex - 1 : this.suggestions.length - 1;

        if(this.suggestionIndex === -1) {
            label = this.query;
            this.select('suggestionsSelector').removeClass('active')
            this.showHint();
        } else {
            label = this.select('suggestionsSelector').removeClass('active')
                .eq(this.suggestionIndex).addClass('active')
                .data('label')
                ;
            this.select('hintSelector').empty();
        }

        this.select('inputSelector').val(label);
    };

    this.highlightNextSuggestion = function() {
        var label
            ;

        if((this.suggestionIndex + 1) < this.suggestions.length) {
            this.suggestionIndex = Math.min(this.suggestionIndex + 1, this.suggestions.length);
            label = this.select('suggestionsSelector').removeClass('active')
                .eq(this.suggestionIndex).addClass('active')
                .data('label')
                ;
            this.select('hintSelector').empty();
        } else {
            label = this.query;
            this.suggestionIndex = -1;
            this.showHint();
        }

        this.select('inputSelector').val(label);
    };

    this.clear = function() {
        this.update();
    };

    this.getValue = function() {
        return this.select('inputSelector').val();
    };

    this.update = function(suggestions) {
        this.suggestions = suggestions || [];
        this.showHint();
        this.populateList();
    };

    this.populateList = function() {
        (function($list, tmpl, suggestions) {
            if(suggestions.length) {
                $list.html(tmpl({
                        suggestions: suggestions
                    }))
                    .addClass('active');
            } else {
                $list.removeClass('active')
                    .empty();
            }
        })
        (this.select('listSelector'), this.attr.templates.suggestions, this.suggestions);
    };

    this.showHint = function() {
        (function($hint, tmpl, suggestion) {
            if(suggestion) {
                $hint.html(tmpl(suggestion))
            } else {
                $hint.empty();
            }
        })
        (this.select('hintSelector'), this.attr.templates.hint, this.suggestions[0] || null);
    };

    this.hideHint = function() {
        this.select('hintSelector').empty();
    }
}

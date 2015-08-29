var flight = require('flight')

module.exports = flight.component(NoeAutoComplete);

function noOp(){};

function NoeAutoComplete() {
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
                else if(this.query !== this.getValue()) {
                    this.getSuggestions();
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
        } else {
            label = this.select('suggestionsSelector').removeClass('active')
                .eq(this.suggestionIndex).addClass('active')
                .data('label')
                ;
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

        } else {
            label = this.query;
            this.suggestionIndex = -1;
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
        this.updateHint();
        this.populateList();
    };

    this.populateList = function() {
        (function($list, tmpl, suggestions) {
            if(suggestions.length) {
                $list.html($.map(suggestions, function(suggestion) {
                        return tmpl({suggestion: suggestion});
                    }.bind(this)))
                    .addClass('active');
            } else {
                $list.removeClass('active')
                    .empty();
            }
        })(this.select('listSelector'), this.attr.templates.suggestion, this.suggestions);
    };

    this.updateHint = function() {
        (function($hint, tmpl, suggestion) {
            if(suggestion) {
                $hint.html(tmpl(suggestion))
            } else {
                $hint.empty();
            }
        })
        (this.select('hintSelector'), this.attr.templates.hint, this.suggestions[0] || null);
    };
}

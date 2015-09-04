var flight = require('flight'),
    _ = require('lodash')
    ;

module.exports = flight.component(NoeAutocomplete);

function noOp(){};

function NoeAutocomplete() {
    this.attributes({
        events: {},
        inputSelector: 'input[type=text]',
        listSelector: 'aside',
        suggestionsSelector: 'aside li',
        hintSelector: 'small',
        templates: {},
        minLength: 3
    });

    this.after('initialize', function() {
        this.suggestions = [];
        this.suggestionIndex = -1;
        this.attr.minLength = Math.max(1, this.attr.minLength);
        this.attr.events = $.extend({
            uiGetSuggestions: 'uiGetSuggestions',
            dataSuggestions: 'dataSuggestions',
            uiSelectedSuggestion: 'uiSelectedSuggestion',
            uiMatchedSuggestion: 'uiMatchedSuggestion'
        }, this.attr.events);

        this.attr.templates = $.extend({
            suggestion: noOp,
            hint: noOp
        }, this.attr.templates);

        this.on('keyup', {
            inputSelector: function(e) {
                if(e.keyCode === 27) {
                    this.clear();
                } else if(e.keyCode === 38) {
                    this.highlightPreviousSuggestion(e);
                } else if(e.keyCode === 40) {
                    this.highlightNextSuggestion();
                }
            }
        });

        this.on('keydown', {
            inputSelector: function(e) {
                if(e.keyCode === 38) {
                    e.preventDefault();
                } else if (e.keyCode === 13){
                    this.triggerSelection(e);
                }
            }
        });

        this.on('keypress', {
            inputSelector: function(e) {
                if([13, 38,40].indexOf(e.keyCode) === -1) {
                    this.getSuggestions();
                }
            }
        })

        this.on(this.attr.events.dataSuggestions, function(e, suggestions) {
            this.update(suggestions);
        });
    });

    this.triggerSelection = function(e) {
        var uiEvent, suggestion
            ;

        if(this.suggestionIndex > -1) {
            uiEvent = this.attr.events.uiSelectedSuggestion;
            suggestion = this.suggestions[this.suggestionIndex];
        } else if(this.suggestions.length) {
            var query = this.query,
                matchedSuggestions = this.suggestions.filter(function(suggestion) {
                    return $.trim(query).toLowerCase() === $.trim(suggestion.name).toLowerCase();
                });

            if(matchedSuggestions.length) {
                uiEvent = this.attr.events.uiMatchedSuggestion;
                suggestion = matchedSuggestions.shift();
            }
        }

        if(!suggestion) return;

        if(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.trigger(uiEvent, suggestion);
    }
    this.getSuggestions = _.debounce(function() {
        (function(component, val) {
            component.suggestionIndex = -1;
            if(val.length >= component.attr.minLength && component.query !== val) {
                component.query = val;
                component.trigger(component.attr.events.uiGetSuggestions, [component.query]);
                component.showHint();
            } else if(val.length < component.attr.minLength) {
                component.clear();
            }
        })(this, this.getValue() || '');
    }, 10);

    this.highlightPreviousSuggestion = function(e) {
        e.preventDefault();

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
            this.select('suggestionsSelector').removeClass('active');
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
        if(!this.suggestions.length && (!suggestions || !suggestions.length)) return;
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
        (function(query, $hint, tmpl, suggestions) {
            if(!query) return;

            suggestions = suggestions.filter(function(suggestion) {
                return suggestion.name.toLowerCase().indexOf(query.toLowerCase()) === 0;
            });

            if(suggestions.length) {
                var suggestion = suggestions.shift(),
                    hint = query + suggestion.name.substr(query.length)
                ;

                $hint.html(tmpl({hint: hint, suggestion: suggestion}))
            } else {
                $hint.empty();
            }
        })
        (this.query, this.select('hintSelector'), this.attr.templates.hint, this.suggestions);
    };

    this.hideHint = function() {
        this.select('hintSelector').empty();
    }
}

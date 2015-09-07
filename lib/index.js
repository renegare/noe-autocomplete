var flight = require('flight')
    ;

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

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
            uiMatchedSuggestion: 'uiMatchedSuggestion',
            uiClose: 'uiClose'
        }, this.attr.events);

        this.attr.templates = $.extend({
            suggestion: noOp,
            hint: noOp
        }, this.attr.templates);

        this.on(this.attr.inputSelector, 'blur', function(e) {
            var that = this;
            this.blurTimeout = setTimeout(function() { that.update(); }, 10);
        });

        this.on('keyup', {
            inputSelector: function(e) {
                if(e.keyCode === 27) {
                    this.update();
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
                } else if ([27, 38, 40, 13].indexOf(e.keyCode) === -1) {
                    this.getSuggestions();
                }
            }
        });

        this.on('keypress', {
            inputSelector: function(e) {
                if([13, 38, 40].indexOf(e.keyCode) === -1) {
                    this.getSuggestions();
                }
            }
        });

        this.on('mouseover', {
            suggestionsSelector: function(e) {
                this.highlight($(e.target).prevAll().length, false);
            }
        });

        this.on('click', {
            suggestionsSelector: function(e) {
                clearTimeout(this.blurTimeout);
                this.highlight($(e.target).prevAll().length, false);
                this.triggerSelection();
            }
        });

        this.on(this.attr.events.dataSuggestions, function(e, suggestions) {
            this.update(suggestions);
        });

        this.on(this.attr.events.uiClose, function(e) {
            this.update();
        });
    });

    this.triggerSelection = function(e) {
        var uiEvent, suggestion
            ;

        if(this.suggestionIndex > -1) {
            uiEvent = this.attr.events.uiSelectedSuggestion;
            suggestion = this.suggestions[this.suggestionIndex];
        } else if(this.suggestions.length) {
            var query = this.getValue(),
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

    this.getSuggestions = debounce(function() {
        this.suggestionIndex = -1;
        this.select('suggestionsSelector').removeClass('active');
        (function(component, val) {
            if(val.length >= component.attr.minLength) {
                component.query = val;
                component.trigger(component.attr.events.uiGetSuggestions, [val]);
                component.showHint();
            } else if(val.length < component.attr.minLength) {
                component.update();
            }
        })(this, this.getValue() || '');
    }, 10);

    this.highlight = function(index, updateDOM) {
        var label = this.query,
            hintAction = 'showHint'
            ;

        updateDOM = updateDOM !== false ? true : updateDOM;

        if(index < -1) {
            index = this.suggestions.length - 1;
        } else if(index >= this.suggestions.length) {
            index = -1;
        }

        var $suggestions = this.select('suggestionsSelector').removeClass('active');

        if(index > -1) {
            label = $suggestions.eq(index)
                .addClass('active')
                .data('label')
                ;
            hintAction = 'hideHint';
        }

        this.suggestionIndex = index;

        if(updateDOM) {
            this.select('inputSelector').val(label);
            this[hintAction]();
        }
    }

    this.highlightPreviousSuggestion = function(e) {
        e.preventDefault();
        this.highlight(this.suggestionIndex - 1);
    };

    this.highlightNextSuggestion = function() {
        this.highlight(this.suggestionIndex + 1);
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
        })(this.select('listSelector'), this.attr.templates.suggestions, this.suggestions);
    };

    this.showHint = function() {
        (function(query, $hint, tmpl, suggestions) {
            suggestions = suggestions.filter(function(suggestion) {
                return suggestion.name.toLowerCase().indexOf(query.toLowerCase()) === 0;
            });

            if(query && suggestions.length) {
                var suggestion = suggestions.shift(),
                    hint = query + suggestion.name.substr(query.length)
                ;

                $hint.html(tmpl({hint: hint, suggestion: suggestion}))
            } else {
                $hint.empty();
            }
        })(this.getValue(), this.select('hintSelector'), this.attr.templates.hint, this.suggestions);
    };

    this.hideHint = function() {
        this.select('hintSelector').empty();
    };
}

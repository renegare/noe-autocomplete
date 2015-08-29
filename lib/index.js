var flight = require('flight')

module.exports = flight.component(NoeAutoComplete);

function noOp(){};

function NoeAutoComplete() {
    this.attributes({
        events: {},
        inputSelector: 'input[type=text]',
        listSelector: 'aside',
        suggestionsSelector: 'div',
        hintSelector: 'p',
        templates: {}
    });

    this.after('initialize', function() {
        this.attr.events = $.extend({
            uiGetSuggestions: 'uiGetSuggestions',
            dataSuggestions: 'dataSuggestions'
        }, this.attr.events);

        this.attr.templates = $.extend({
            suggestion: noOp,
            hint: noOp
        }, this.attr.templates);

        this.on('keydown', {
            inputSelector: function() {
                this.trigger(this.attr.events.uiGetSuggestions, [this.getValue()]);
            }
        });

        this.on('keyup', {
            inputSelector: function(e) {
                if(e.keyCode === 27) {
                    this.clear();
                }
            }
        });

        this.clear = function() {
            this.update();
        }

        this.on(this.attr.events.dataSuggestions, function(e, suggestions) {
            this.updateHint(suggestions[0]);
            this.populateList(suggestions);
        });
    });

    this.getValue = function() {
        return this.select('inputSelector').val();
    }

    this.update = function(suggestions) {
        suggestions = suggestions || [];
        this.updateHint(suggestions[0] || null);
        this.populateList(suggestions);
    }

    this.populateList = function(suggestions) {
        (function($list, tmpl) {
            if(suggestions.length) {
                $list.html($.map(suggestions, function(suggestion) {
                        return tmpl({suggestion: suggestion});
                    }.bind(this)))
                    .addClass('active');
            } else {
                $list.removeClass('active')
                    .empty();
            }
        })(this.select('listSelector'), this.attr.templates.suggestion);

    }

    this.updateHint = function(suggestion) {
        (function($hint, tmpl) {
            if(suggestion) {
                $hint.html(tmpl(suggestion))
            } else {
                $hint.empty();
            }
        })
        (this.select('hintSelector'), this.attr.templates.hint);
    }
}

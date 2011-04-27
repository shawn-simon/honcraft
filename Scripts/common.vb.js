var common =
{
    debug: {

        println: function (obj) {
            $('<br/><div>' + JSON.stringify(obj) + '</div>').appendTo(common.debug.console);
        },

        clear: function ()
        { },

        console: null,

        setConsole: function (jQuery) {
            common.debug.console = jQuery;

        }
    }
};
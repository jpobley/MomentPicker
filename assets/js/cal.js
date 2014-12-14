(function($){

    // define variaables that we'll reuse
    var today = moment(),
        DTD = today.date(),
        MTD = today.month(),
        YTD = today.year(),

        selectedMonth,
        firstOfTheMonth,
        monthLength,
        dates,
        selected,

        summaryFormat = "MMMM Do",

        $monthName = $("#month-name"),
        $grid = $("#grid"),
        $summary = $("#summary"),
        $full = $("#full"),

        BOX_MARGIN = 4,
        BOX_SIZE = 60 + (BOX_MARGIN * 2);

    // initialize all the variables and build the calendar
    function init() {
        selectedMonth = today.month();
        firstOfTheMonth = today.startOf("month").day();
        monthLength = today.endOf("month").date();
        dates = _.range(1, monthLength + 1);
        selected = [];

        // fill in the month
        var monthString = today.format("MMMM YYYY");
        $monthName.text(monthString);

        // draw the grid
        buildGrid();
    };

    // keep track of what days we've selected
    function updateSelected(stamp) {
        selected.push(stamp);
        selected.sort(function(a,b){return a-b;});
    };

    // handler for when a day is clicked
    function dayClickHandler(event) {
        event.stopPropagation();

        var stamp = parseInt($(this).data("date")),
            $selectedDays = $(".day.selected");

        if ( selected.length < 2 && _(selected).indexOf(stamp) === -1 ) {
            $(this).addClass('selected');
            updateSelected(stamp);
        }
        else if (stamp === selected[0]) {
            $(this).removeClass("selected highlight");
            selected.shift();
            if (selected.length === 1)
                highlighter(selected[0]);
        }
        else if (stamp === selected[1]) {
            $(this).removeClass("selected highlight");
            selected.pop();
            highlighter(selected[0]);
        }
        else if (stamp < selected[0]) {
            $(this).addClass("selected");
            var el = _($selectedDays).filter(function( day ) { return $(day).data("date") == selected[0]});
            $(el).removeClass("selected");
            selected[0] = stamp;
            highlighter(true);
        }
        else {
            $(this).addClass("selected");
            var el = _($selectedDays).filter(function( day ) { return $(day).data("date") == selected[1]});
            $(el).removeClass("selected");
            selected[1] = stamp;
            highlighter(true);
        }

        if (selected.length === 2)
            createSummary();
        else
            $full.empty();
    };

    // handler for when a day is hovered over
    function dayHoverHandler(event) {
        $(this).toggleClass("hover");
        var stamp = parseInt($(this).data("date"));
        highlighter( stamp );
    };

    // highlight the days in the range
    function highlighter(stamp) {
        
        if ( selected.length === 1 && typeof stamp !== "boolean") {
            var range = [selected[0], stamp].sort( function(a,b){return a-b;});
            range = _.range( range[0], (range[1]+1) );

            $(".day").each( function( i, obj ){
                
                var pick = parseInt($(obj).data("date"));

                if( _.indexOf(range, pick) !== -1 ) {
                    $(obj).addClass("highlight");
                    var length = (Math.abs( _.last(range) - _.first(range) ) + 1) + " day";
                    if ( parseInt(length) > 1 || parseInt(length) === 0 )
                        length = length + "s";
                    $summary.html(length);
                }
                else{
                    $(obj).removeClass("highlight");
                }

            });
        } else if ( selected.length === 2 && stamp ) {
            var range = _.range( selected[0], (selected[1]+1) );

            $(".day").each( function( i, obj ){
                
                var pick = parseInt($(obj).data("date"));

                if( _(range).indexOf(pick) !== -1 ) {
                    $(obj).addClass("highlight");
                    var length = (Math.abs( _(range).last() - _(range).first() ) + 1) + " day";
                    if ( parseInt(length) > 1 || parseInt(length) === 0 )
                        length = length + "s";
                    $summary.html(length);
                }
                else{
                    $(obj).removeClass("highlight");
                }

            });
        }

    };



    // build the Dom for the calendar
    function buildGrid() {
        // empty it out the container first
        $grid.empty();

        // create an element for each day in our date range
        _(dates).each(function(date) {
            var $el = $("<div></div>")
                .addClass("day")
                .data("date", date)
                .text(date)
                .wrapInner("<span></span>")
                .on({
                    click: dayClickHandler,
                    mouseenter: dayHoverHandler,
                    mouseleave: dayHoverHandler
                })
                .appendTo($grid);

            if (selectedMonth === MTD && date === DTD && today.year() === YTD)
                $el.addClass("today");
        });

        // offset the first of the month appropriately
        var marginLeft = (firstOfTheMonth * BOX_SIZE) + BOX_MARGIN;
        $(".day").first().css("margin-left", marginLeft);

        $(".wrapper").show();
    };

    // generate the text for the summary
    function createSummary() {
        var startStr = today.date(selected[0]).format(summaryFormat),
            endStr = today.date(selected[1]).format(summaryFormat),
            str = startStr + " to " + endStr;
        $full.html(str);
    };

    // handler for the rest button
    function reset(event) {
        $full.add($summary).empty();
        selected = [];
        $(".selected").add(".highlight").removeClass("selected highlight");

        // if the button was actually clicked go back to today
        if (event)
            today.year(YTD).month(MTD).date(DTD);

        init();
    }

    // handler for the month change buttons
    function changeMonth(event) {
        event.stopPropagation();

        var step = parseInt($(this).data("step"));
        today.add(step, "month");
        reset();
    };

    $(document).ready(function(){

        // register click handlers
        $("#reset").click(reset);

        $(".month-switch").click(changeMonth);

        // let's do this
        init();
    });
})(jQuery);


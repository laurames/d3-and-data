/**
 * Created by sachin on 4/4/15.
 */
var MAX_PARTITIONS = 3;

$( document ).ready(function() {
    var margin = {top: 10, right: 10, bottom: 50, left: 50},
        width = document.getElementById('relative').offsetWidth-100,
        height = window.innerHeight - 80;

    var zoomed = false;

    var x = d3.scale.linear()
        .range([width, 0]);

    var y = d3.scale.linear()
        .range([height, 0]);

    //coloring the different lines
    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("#svgGraph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    $( ".start" ).click(function() {
        begin();
    });

    function begin() {
        $( ".start" ).off("click");
        $(".relative").hide();
        $("html").css("background", "#040404");
        runner("../json/1.json");
        var figure = $("#svgGraph");
        figure.show();
        figure.append('<p><a class="btn btn-lg btn-success next" href="#" role="button">Next</a></p>');
        figure.append('<p><a class="btn btn-lg btn-success prev" href="#" role="button">Prev</a></p>');
        var nextButton = $(".next");
        var prevButton = $(".prev");
        prevButton.hide();
        nextButton.data("next", 2);
        prevButton.data("prev", 1)
        nextButton.click(function() {
            loadNext();
        })

    }

    function loadNext() {
        var nextButton = $(".next");
        var prevButton = $(".prev");
        var currentPage = nextButton.data("next");
        runner("../json/" + nextButton.data("next") + ".json");
        if(currentPage < MAX_PARTITIONS) {
            nextButton.data("next", currentPage+1);
        } else {
            nextButton.on("click", function() {
                rotate();
            })
        }
        prevButton.data("prev", currentPage - 1);
        if(currentPage > 1) {
            prevButton.show();
            prevButton.unbind("click");
            prevButton.click("click", function() {
                var nextButton = $(".next");
                var nextPointer = nextButton.data("next");
                nextButton.data("next", nextPointer - 1);
                var prevPage = prevButton.data("prev");
                runner("../json/" + prevPage + ".json");
                if(prevPage > 1) {
                    prevButton.data("prev", prevPage-1);
                } else {
                    prevButton.hide();
                    nextButton.data("next", prevPage + 1);
                    nextButton.show();
                }
            })
        }
    }

    function rotate() {
        var nextButton = $(".next");
        nextButton.remove();
        var prevButton = $(".prev");
        prevButton.remove();
        $("#svgGraph").hide();
        $(".relative").show();
        $( ".btn" ).click(function() {
            $("#svgGraph").show();
            begin();
        });

    }

    function runner(jsonFile) {
        d3.select("g").selectAll("*").remove();

        var line = d3.svg.line()
            .interpolate("basis")
            .x(function (d) {
                return x(d.countTime);
            })
            .y(function (d) {
                return y(d.temperature);
            });


        //load external data:
        d3.json(jsonFile, function (error, json) {
            $('body').append('<p> ' + jsonFile + '</p>')
            if (error != null) return console.warn(error);
            visualizeit(json);
        });

        function visualizeit(data) {
            color.domain(d3.keys(data[0]).filter(function (key) {
                return key !== "countTime" && key !== "color";
            }));

            var temperatures = color.domain().map(function (name) {
                return {
                    name: name,
                    values: data.map(function (d) {
                        return {countTime: d.countTime, temperature: +d[name]};
                    })
                };
            });

            x.domain(d3.extent(data, function (d) {
                return d.countTime;
            }));

            y.domain([
                d3.min(temperatures, function (c) {
                    return d3.min(c.values, function (v) {
                        return v.temperature;
                    })-1;
                }),
                d3.max(temperatures, function (c) {
                    return d3.max(c.values, function (v) {
                        return v.temperature;
                    })+1;
                })
            ]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("dy", "-2em")
                .style("text-anchor", "end")
                .text("Temperature delta T");

            var difTemp = svg.selectAll(".temp")
                .data(temperatures)
                .enter().append("g")
                .attr("class", "temp");

            difTemp.append("path")
                .attr("class", "line")
                .attr("d", function (d) {
                    return line(d.values);
                })
                .style("stroke", function (d) {
                    return color(d.name);
                });

            /* Only on the big graph
            svg.append("g")
                .attr("class", "baseLine")
                .append("line")
                .attr("x1", 0)
                .attr("y1", (height / 13.5) * 4)
                .attr("x2", width)
                .attr("y2", (height / 13.5) * 4)
                .attr("stroke-width", 1)
                .attr("stroke", "white");*/
        };
    }
});



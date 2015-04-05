/**
 * Created by sachin on 4/4/15.
 */
var MAX_PARTITIONS = 3;

var xAxis, yAxis, svg;
var x, y;
var color;
var svgLine;
$( document ).ready(function() {
    var margin = {top: 10, right: 10, bottom: 50, left: 50},
        width = window.innerWidth - 60;
    height = window.innerHeight - 60;

    x = d3.scale.linear()
        .range([width, 0]);

    y = d3.scale.linear()
        .range([height, 0]);

    //coloring the different lines
    color = d3.scale.category10();

    xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    svg = d3.select("#svgGraph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "end")
        .text("Temperature delta T");

    svg.append("g")
        .attr("class", "baseLine")
        .append("line")
        .attr("x1", 0)
        .attr("y1", (height / 13.5) * 4)
        .attr("x2", width)
        .attr("y2", (height / 13.5) * 4)
        .attr("stroke-width", 1)
        .attr("stroke", "black");

    $( ".start" ).click(function() {
        begin();
    });

    svgLine = d3.svg.line()
        .interpolate("basis")
        .x(function (d) {
            return x(d.countTime);
        })
        .y(function (d) {
            return y(d.temperature);
        });

    function begin() {
        $( ".start" ).off("click");
        $(".relative").hide();
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
        firstRun("../json/1.json");
    }

    function loadNext() {
        var nextButton = $(".next");
        var prevButton = $(".prev");
        var clickedPage = nextButton.data("next");
        runner("../json/" + clickedPage + ".json");
        if(clickedPage < MAX_PARTITIONS) {
            nextButton.data("next", clickedPage + 1);
        } else {
            nextButton.unbind("click");
            nextButton.on("click", function() {
                rotate();
            })
        }
        prevButton.data("prev", clickedPage - 1);
        if(clickedPage > 1) {
            prevButton.show();
            prevButton.unbind("click");
            prevButton.click("click", function() {
                var nextButton = $(".next");
                var nextPointer = nextButton.data("next");
                nextButton.data("next", nextPointer - 1);
                var prevPage = prevButton.data("prev");
                var prevPage = prevButton.data("prev");
                runner("../json/" + prevPage + ".json");
                if(prevPage > 1) {
                    prevButton.data("prev", prevPage-1);
                } else {
                    prevButton.hide();
                    nextButton.data("next", 2);
                    nextButton.unbind("click");
                    nextButton.on("click", function() {
                        loadNext();
                    })
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

    function fillColorDomain(data) {
        color.domain(d3.keys(data[0]).filter(function (key) {
            return key !== "countTime" && key !== "rsl";
        }));
    }

    function generateTempColors(data) {
        var temperatures = color.domain().map(function (name) {
            return {
                name: name,
                values: data.map(function (d) {
                    return {countTime: d.countTime, temperature: +d[name]};
                })
            };
        });
        return temperatures;
    }

    function setAxisDomains(data) {
            x.domain(d3.extent(data, function (d) {
                return d.countTime;
            }));

            y.domain([
                d3.min(temperatures, function (c) {
                    return d3.min(c.values, function (v) {
                        return v.temperature;
                    });
                }),
                d3.max(temperatures, function (c) {
                    return d3.max(c.values, function (v) {
                        return v.temperature;
                    });
                })
            ]);
        }

    function firstRun(jsonFile) {
        d3.json(jsonFile, function (error, data) {
            if (error != null) return console.warn(error);

            fillColorDomain(data);
            temperatures = generateTempColors(data);

            var difTemp = svg.selectAll(".temp")
                    .data(temperatures)
                    .enter().append("g")
                    .attr("class", "temp");
            
            setAxisDomains(data);    
            difTemp.append("path")
                .attr("class", "line")
                .attr("d", function (d) {
                    return svgLine(d.values);
                })
                .style("stroke", function (d) {
                    return color(d.name);
                });
        });
    }

    function runner(jsonFile) {
        //load external data:
        d3.json(jsonFile, function (error, json) {
            if (error != null) return console.warn(error);
            visualizeit(json);
        });

        function visualizeit(data) {
            fillColorDomain(data);
            generateTempColors(data);

            setAxisDomains(data);

            var graphics = d3.select("#svgGraph").transition();
            graphics.selectAll('.line')
            .duration(1000)
            .attr("d", function(d) {
                if(d.name == "sTemp") {
                    return svgLine(generateTempColors(data)[0].values);
                } else { 
                    return svgLine(generateTempColors(data)[1].values); 
                }
            });
            graphics.select(".x.axis") // change the x axis
                .duration(750)
                .call(xAxis);
            graphics.select(".y.axis") // change the y axis
                .duration(750)
                .call(yAxis);


        }
    }

});
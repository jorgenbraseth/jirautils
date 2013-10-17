function newSearch() {
    hasher.setHash($("#searchTerm").val());
}

function componentFromName(name) {
    var id = COMPONENT_IDS[name];
    if(id) {
        return drawing().find(id);
    }
}
function highlightElement(elm) {
    if( elm.css("fill") ){
        var red = Math.round(Math.random() * 155)+100;
        var green = Math.round(Math.random() * 155)+100;
        var blue = Math.round(Math.random() * 155)+100;
        elm.css("fill","rgb("+red+","+green+","+blue+")");
    }

    window.setTimeout(function(){highlightElement(elm)},Math.random()*200);
}

function highlight(element) {
    if(element){
        highlightElement(element);
    }
}

function drawing() {
    return $($("#drawing")[0].contentDocument);
}
function update() {
    var fullUrl = rootUrl + maxResults + "&jql=" + jql;
    refreshGraphics();
    $("object").css("visibility","hidden");
    var loadingtext = $("<br/><span>Searching...</span>");
    $("#graphicsWrapper").append(loadingtext);
    $.getJSON(fullUrl, {}, function (data) {
        $("object").css("visibility","visible");
        graphData = makeGraphData(data.issues);
        console.log(graphData);
        $.each(graphData[DRAWING_HIGHLIGHT_FIELD], function (idx, component) {
            var element = componentFromName(component.id);
            highlight(element);
        });
    }).fail(function(error){
            console.log(error);
            alert("Something went wrong!\n\n"+error.responseJSON.errorMessages)
        }).complete(function(){
            $("object").css("visibility","visible");
            loadingtext.remove();
        })
}

//handle hash changes
function handleChanges(newHash, oldHash) {
    jql = newHash;
    $("#searchTerm").val(jql);
    update();
}

function refreshGraphics() {
    var graphics = $("object").attr("data",DRAWING_IMAGE_FILE);
    graphics.remove();
    $("#graphicsWrapper").append(graphics);

}

$(function () {
    hasher.changed.add(handleChanges); //add hash change listener
    hasher.initialized.add(handleChanges); //add initialized listener (to grab initial value in case it is already set)
    hasher.init(); //initialize hasher (start listening for history changes)
});


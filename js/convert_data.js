function createIssueNode(jiraIssue, inSet) {
    return {
        id:jiraIssue.key,
        summary:jiraIssue.fields.summary,
        status:jiraIssue.fields.status,
        type: jiraIssue.fields.issuetype,
        priority: jiraIssue.fields.priority,
        url: rootIssueUrl + jiraIssue.key,
        nodeType: inSet ? "issue":"dependantIssue",
        estimat: jiraIssue.fields.timeestimate,
        poengestimat: jiraIssue.fields.customfield_10031
    }
}

function removeDependantIssues() {
    var a = $.map(graphData.nodes,function(it){if(it.nodeType=="dependantIssue"){ return it}})
    removeNodes(graph, a)
}

function createNodes(issues) {
    var nodes = {};

    //Make all linked nodes
    $.each(issues, function (idx, issue) {
        var links = createLinksForIssue(issue);
        $.each(links,function(idx, link){
            nodes[link.linkedIssue.key] = createIssueNode(link.linkedIssue, false) ;
        });
    });

    //Make all resultset nodes
    $.each(issues, function (idx, issue) {
        nodes[issue.key] = createIssueNode(issue, true);
    });


    return nodes;
}

function createLinksForIssue(issue) {
    var links = [];
    // Links to other issues
    $.each(issue.fields.issuelinks,function(idx,link){
        if($.inArray(link.type.name, LINKS_TO_DRAW) > -1 ){
            if(link.outwardIssue){
                links.push({
                    from: issue.key,
                    to: link.outwardIssue.key,
                    type: link.type.name,
                    linkedIssue: link.outwardIssue
                });
            }else if(link.inwardIssue){
                links.push({
                    to: issue.key,
                    from: link.inwardIssue.key,
                    type: link.type.name,
                    linkedIssue: link.inwardIssue,
                    type: link.type.name
                });
            }
        }
    });

    return links;
}

function createVersionLinksForIssue(issue){
    var links = [];
    // Links to versions
    $.each(issue.fields.fixVersions,function(idx,version){
        links.push({
            from: issue.key,
            to: version.name,
            type: "version",
            linkedIssue: {}
        });
    });

    if(links.length == 0){
        links.push({
            from: issue.key,
            to: "unplanned",
            type: "version",
            linkedIssue: {}
        });
    }

    return links;
}
function makeIssueLinks(issues) {
    var links = [];
    $.each(issues, function (idx, issue) {
        links = links.concat( createLinksForIssue(issue) );
    });

    return links;
}
function makeVersionLinks(issues) {
    var links = [];
    $.each(issues, function (idx, issue) {
        links = links.concat( createVersionLinksForIssue(issue) );
    });
    return links;
}


function createVersionsForIssue(versions, issue) {
    if(issue.fields.fixVersions.length == 0){
        versions["unplanned"] = {id:"unplanned", nodeType: "version"}
    }
    $.each(issue.fields.fixVersions, function(idx, version){
        versions[version.name] = {
            id:version.name,
            nodeType: "version"
        };
    });
}
function makeVersions(issues) {
    var versions = {};
    $.each(issues, function (idx, issue) {
        createVersionsForIssue(versions, issue);
    });

    return versions;
}

function createComponentsForIssue(components, issue) {
    $.each(issue.fields.components, function(idx, component){
        components[component.name] = {
            id:component.name,
            nodeType: "component"
        };
    });
}
function makeComponents(issues) {
    var components = {};
    $.each(issues, function (idx, issue) {
        createComponentsForIssue(components, issue);
    });

    return components;
}

function createPeopleForIssue(people, issue) {
    var person;
    if(issue.fields.assignee){
        person = issue.fields.assignee;
        people[person.name] = {id:person.name, name:person.displayName, icon:person.avatarUrls['48x48'], nodeType:"person"};
    }
//    if(issue.fields.reporter){
//        person = issue.fields.reporter;
//        people[person.name] = {id:person.name, name:person.displayName, icon:person.avatarUrls['48x48'], nodeType:"person"};
//    }
}
function makePeople(issues) {
    var people = {};
    $.each(issues, function (idx, issue) {
        createPeopleForIssue(people, issue);
    });

    return people;
}

function makeComponentLinks(issues) {
    var links = [];
    $.each(issues, function (idx, issue) {
        links = links.concat( makeComponentLinksForIssue(issue) );
    });
    return links;
}
function makeComponentLinksForIssue(issue) {
    var links = [];
    // Links to versions
    $.each(issue.fields.components,function(idx,component){
        links.push({
            from: issue.key,
            to: component.name,
            type: "component"
        });
    });

    return links;
}

function makePeopleLinks(issues) {
    var links = [];

    $.each(issues, function (idx, issue) {
        links = links.concat( makePeopleLinksForIssue(issue) );
    });

    return links;
}
function makePeopleLinksForIssue(issue) {
    var links = [];
    if(issue.fields.assignee){
        person = issue.fields.assignee;
        links.push({
            from: issue.key,
            to: person.name,
            type: "assignee"
        });
    }

    return links;
}

function makeGraphData(issues) {
    var graphData = {
        nodes: createNodes(issues),
        fixVersions: makeVersions(issues),
        components: makeComponents(issues),
        people: makePeople(issues),
        issueLinks: makeIssueLinks(issues),
        versionLinks: makeVersionLinks(issues),
        componentLinks: makeComponentLinks(issues),
        peopleLinks: makePeopleLinks(issues)
    };
    linksData = graphData
    return graphData;
}

function removeNodes(graph, nodes){
    $.each(nodes,function(){
        graph.removeNode(this.id);
        graph.forEachLinkedNode(this.id, function(linkedNode, link){
            graph.removeLink(link);
        });
    });
}
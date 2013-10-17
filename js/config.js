var rootIssueUrl = "https://aurora/jira/browse/";
var jql = "";
var maxResults = "1500";
var themeRoot = "img/theme2";
var DRAWING_IMAGE_FILE = "img/components_new.svg";
var DRAWING_HIGHLIGHT_FIELD = "components";

var rootUrl = "https://aurora/jira/rest/api/2/search?maxResults=";
var ICON_SET = {
    dependantIssue: themeRoot + "/issue_dependent.png",
    dependantIssue_done: themeRoot + "/issue_dependent_done.png",
    dependantIssue_in_progress: themeRoot + "/issue_dependent_in_progress.png",
    issue: themeRoot + "/issue.png",
    version: themeRoot + "/version.png",
    component: themeRoot + "/component.png",
    project: themeRoot + "/project.png",
    unknown_nodetype: themeRoot + "/unknown.png",
    locked: themeRoot + "/lock_closed.png",
    unlocked: themeRoot + "/lock_open.png",
    issue_done: themeRoot + "/issue_done.png",
    issue_in_progress: themeRoot + "/issue_in_progress.png"
};

var LINKS_TO_DRAW = ["Requires","Relates"];

var LINK_STYLES = {
    default: {
        stroke: 'rgba(100,100,100,0.3)',
        strokeWidth: 1,
        style:"1"
    },
    Requires: {
        stroke: 'rgba(150,150,150,0.4)',
        strokeWidth: 5,
        style:"0"
    },

    Relates: {
        stroke: 'rgba(150,150,150,0.4)',
        strokeWidth: 2,
        style:"2 1"
    },

    assignee: {
        stroke: 'rgba(255,0,255,0.3)',
        strokeWidth: 1,
        style:"2"
    },
    reporter: {
        stroke: 'rgba(255,0,255,0.3)',
        strokeWidth: 1,
        style:"2"
    },
    component: {
        stroke: 'rgba(100,100,250,0.3)',
        strokeWidth: 1,
        style:"2"
    },
    version: {
        stroke: 'rgba(150,200,0,0.3)',
        strokeWidth: 1,
        style:"2"
    }
};


var COMPONENT_IDS = {
	"AKU-web": "#akuweb",
	"Arbeidsflate": "#arbeidsflaten",
	"SL Grunnlagsdata": "#slgld",
	"DVH Grunnlagsdata": "#dvhgld",
	"Digitalmottak": "#eksterntmottak",
	"Ekstern kommunikasjon": "#eksternkommunikasjon",
    "Ekstern Utsending": "#eksternutsending",
    "Meldingsproduksjon": "#meldingsproduksjon",
	"Ikke-funksjonelle krav": "#kryssfunksjonellekrav",
	"Magnet Web": "#magnetweb",
    "Magnet Felles": "#magnetfelles",
    "Magnet-EDAG-testtool": "#edagtesttool",
	"Oppslagstjeneste": "#oppslagstjeneste",
	"Partsregister": "#preg",
	"Partsregister import": "#pimp",
	"Skatteinfo": "#skatteinfo",
	"Skatteinfo BOKS": "#boks",
	"Skatteinfo IRIS": "#iris",
	"Skatteinfo IRIS-rapportering": "#irisrapportering",
	"Virksomhetsprosesslogg": "#vpl",
	"Magnet-EDAG": "#magnetamelding",
	"Magnet-Mottak": "#magnetgld",
	"Manuell identifisering": "#akuweb",
	"SI Grunnlagsdata": "#si",
    "Manntall": "#manntall",
    "OECD": "#oecd",
    "Konto-konto": "#kontokonto"
};

fakeit = true;
var fakeData = { issues: [ {
            fields:{ issuelinks:[], fixVersions:[], components:[
                {name: "Skatteinfo IRIS"},
                {name: "AKU-web"},
                {name: "Arbeidsflate"},
                {name: "SL Grunnlagsdata"},
                {name: "DVH Grunnlagsdata"},
                {name: "Digitalmottak"},
                {name: "Ekstern kommunikasjon"},
                {name: "Ekstern Utsending"},
                {name: "Meldingsproduksjon"},
                {name: "Ikke-funksjonelle krav"},
                {name: "Magnet Web"},
                {name: "Magnet Felles"},
                {name: "Magnet-EDAG-testtool"},
                {name: "Oppslagstjeneste"},
                {name: "Partsregister"},
                {name: "Partsregister import"},
                {name: "Skatteinfo"},
                {name: "Skatteinfo BOKS"},
                {name: "Skatteinfo IRIS"},
                {name: "Skatteinfo IRIS-rapportering"},
                {name: "Virksomhetsprosesslogg"},
                {name: "Magnet-EDAG"},
                {name: "Magnet-Mottak"},
                {name: "Manuell identifisering"},
                {name: "SI Grunnlagsdata"},
                {name: "Manntall"},
                {name: "Oecd"},
                {name: "Konto-konto"},
                {name: "Skatteinfo"}
                ]} } ] };

if (fakeit) {
    $.getJSON = function(url, data, callback){
        console.log("Faking XHR!");

        window.setTimeout(function(){callback(fakeData);},500);
        var xhr = {
            success: function () {
                return this
            },
            fail: function () {
                return this
            },
            complete: function (f) {
                window.setTimeout(f,1000);
                return this;
            }
        };
        return  xhr;
    }
}
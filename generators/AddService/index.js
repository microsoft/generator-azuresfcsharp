'use strict';

var path      = require('path')
, generators    = require('yeoman-generator')
, yosay     = require('yosay')

var JavaGenerator = generators.Base.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);

        this.desc('Generate Service Fabric CSharp app template');
        var chalk = require('chalk');
        if (this.config.get('projName')) {
            console.log(chalk.green("Setting project name to", this.config.get('projName')));
        } else {
            var err = chalk.red("Project name not found in .yo-rc.json. Exiting ..."); 
            throw err;
        }
    },

    prompting: function () {
        var done = this.async();

        var prompts = [{
            type: 'list'
            , name: 'frameworkType'
            , message: 'Choose a framework for your service'
            , default: this.config.get('frameworkType')
            , choices: ["Reliable Actor Service", "Reliable Stateless Service"]
            }];

            this.prompt(prompts, function (props) {
            this.props = props;
            this.config.set(props);

            done();
        }.bind(this));
    },

    writing: function() {
        var libPath = "REPLACE_SFLIBSPATH";
        var isAddNewService = true; 
        if (this.props.frameworkType == "Reliable Actor Service") {
            this.composeWith('azuresfcsharp:CoreCLRStatefulActor', {
            options: { libPath: libPath, isAddNewService: isAddNewService }
        });
        } else if (this.props.frameworkType == "Reliable Stateless Service") {
            this.composeWith('azuresfcsharp:CoreCLRStatelessService', {
            options: { libPath: libPath, isAddNewService: isAddNewService }
            });
        }

    },
    end: function () {
        this.config.save();
    }
});

module.exports = JavaGenerator;


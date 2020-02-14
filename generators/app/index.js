"use strict";

var path = require("path"),
  yosay = require("yosay"),
  Generator = require("yeoman-generator");

var isGuestUseCase = false;
var JavaGenerator = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.desc("Generate Service Fabric CSharp app template");
  }

  async prompting() {
    this.log(yosay("Welcome to Service Fabric generator for CSharp"));

    var prompts = [
      {
        type: "input",
        name: "projName",
        message: "Name your application",
        default: this.config.get("projName"),
        validate: function(input) {
          return input ? true : false;
        }
      },
      {
        type: "list",
        name: "frameworkType",
        message: "Choose a framework for your service",
        default: this.config.get("frameworkType"),
        choices: [
          "Reliable Actor Service",
          "Reliable Stateless Service",
          "Reliable Stateful Service"
        ]
      }
    ];

    await this.prompt(prompts).then((answers) => {
      answers.projName = answers.projName.trim();

      this.props = answers;
      this.config.set(answers);
    });
  }

  writing() {
    console.log(this.props);
    var libPath = "REPLACE_SFLIBSPATH";
    var isAddNewService = false;
    if (this.props.frameworkType == "Reliable Actor Service") {
      this.composeWith("azuresfcsharp:CoreCLRStatefulActor", {
        options: { libPath: libPath, isAddNewService: isAddNewService }
      });
    } else if (this.props.frameworkType == "Reliable Stateless Service") {
      this.composeWith("azuresfcsharp:CoreCLRStatelessService", {
        options: { libPath: libPath, isAddNewService: isAddNewService }
      });
    } else if (this.props.frameworkType == "Reliable Stateful Service") {
      this.composeWith("azuresfcsharp:CoreCLRStatefulService", {
        options: { libPath: libPath, isAddNewService: isAddNewService }
      });
    }
  }

  end() {
    this.config.save();
    if (this.isGuestUseCase == false) {
      //this is for Add Service
      var nodeFs = require("fs");
      if (
        nodeFs
          .statSync(path.join(this.destinationRoot(), ".yo-rc.json"))
          .isFile()
      ) {
        nodeFs
          .createReadStream(path.join(this.destinationRoot(), ".yo-rc.json"))
          .pipe(
            nodeFs.createWriteStream(
              path.join(
                this.destinationRoot(),
                this.props.projName,
                ".yo-rc.json"
              )
            )
          );
      }
    }
  }
};

module.exports = JavaGenerator;

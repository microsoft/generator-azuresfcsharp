'use strict';

var path   = require('path')
, generators = require('yeoman-generator');

var ClassGenerator = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
    
    this.desc('Generate Stateful Service application template');
    this.option('libPath', {
      type: String
      , required: true
    });
    this.option('isAddNewService', {
      type: Boolean
      , required: true
    });
    this.libPath = this.options.libPath;
    this.isAddNewService = this.options.isAddNewService;
  
  },
  
  prompting: function () {
    var done = this.async();
    var utility = require('../utility');
    var prompts = [{
      type: 'input'
      , name: 'serviceFQN'
      , message: 'Enter the name of service : '
      , validate: function (input) {
        return input ? utility.validateFQN(input) : false;
      }
    }];
    
    this.prompt(prompts, function(input) {
      this.serviceFQN = input.serviceFQN;
      var parts = this.serviceFQN.split('.')
      , name  = parts.pop();
      this.packageName = parts.join('.');
      this.dir = parts.join('/');
      this.serviceName = utility.capitalizeFirstLetter(name.trim());
      if (!this.packageName) {
        this.packageName = "statefulervice";
        this.serviceFQN = "statefulservice." + this.serviceFQN;
        this.dir = this.dir + "/statefulservice";
      }
      done();
    }.bind(this));
  },
  
  initializing: function () {
  this.props = this.config.getAll();
  this.config.defaults({
  author: '<your name>'
  });
  },
  
  writing: function () {
    var serviceProjName = this.serviceName;
    var appPackage = this.props.projName;
    var servicePackage = this.serviceName + 'Pkg';
    var serviceName = this.serviceName   ;
    var serviceTypeName = this.serviceName + 'Type';
    var appTypeName = this.props.projName+ 'Type';
    var appName = this.props.projName;
    
    var serviceJarName = (this.serviceName).toLowerCase();

    var serviceMainClass = this.serviceName + 'Service';
    var endpoint = serviceName + 'Endpoint';
    var replicatorEndpoint = serviceName + 'ReplicatorEndpoint';
    var replicatorConfig = serviceName + 'ReplicatorConfig';
    var replicatorSecurityConfig = serviceName + 'ReplicatorSecurityConfig';
    var localStoreConfig = serviceName + 'LocalStoreConfig';
 
    var appPackagePath = this.isAddNewService == false ? path.join(this.props.projName, appPackage) :  appPackage;
    var serviceSrcPath = path.join(this.props.projName, serviceProjName) ;
    appPackagePath = appName;

    var serviceProject = path.join(appPackage , 'src' , serviceSrcPath , serviceProjName + '.csproj');
    var codePath = path.join(appPackage , appPackagePath, servicePackage, 'Code');

    var is_Windows = (process.platform == 'win32');
    var is_Linux = (process.platform == 'linux');
    var is_mac = (process.platform == 'darwin');

    var sdkScriptExtension;
    var buildScriptExtension;
    var serviceManifestFile;
    if (is_Windows)
    {
      sdkScriptExtension = '.ps1';
      buildScriptExtension = '.cmd';
      serviceManifestFile = 'ServiceManifest.xml';
    }
    else {
      sdkScriptExtension = '.sh';
      buildScriptExtension = '.sh';
    }
    if (is_Linux) serviceManifestFile = 'ServiceManifest_Linux.xml';
    if (is_mac) serviceManifestFile = 'ServiceManifest.xml';

    this.fs.copyTpl(
      this.templatePath('service/app/appPackage/servicePackage/'+serviceManifestFile),
      this.destinationPath(path.join(appPackage , appPackagePath, servicePackage, 'ServiceManifest.xml')),
      {
        servicePackage: servicePackage,
        serviceTypeName: serviceTypeName,
        serviceName: serviceName,
        serviceProjName: serviceProjName
      } 
    );
      if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('service/app/appPackage/ApplicationManifest.xml'),
        this.destinationPath(path.join(appPackage , appPackagePath, 'ApplicationManifest.xml')),
        {
          appTypeName: appTypeName,
          servicePackage: servicePackage,
          serviceName: serviceName,
          serviceTypeName: serviceTypeName
        } 
      );
    } else {
      var fs = require('fs'); 
      var xml2js = require('xml2js');
      var parser = new xml2js.Parser();
      fs.readFile(path.join(appPackage , appPackagePath, 'ApplicationManifest.xml'), function(err, data) {
      parser.parseString(data, function (err, result) {
          if (err) {
              return console.log(err);
          }
          result['ApplicationManifest']['ServiceManifestImport'][result['ApplicationManifest']['ServiceManifestImport'].length] =
             {"ServiceManifestRef":[{"$":{"ServiceManifestName":servicePackage, "ServiceManifestVersion":"1.0.0"}}]}
          result['ApplicationManifest']['DefaultServices'][0]['Service'][result['ApplicationManifest']['DefaultServices'][0]['Service'].length] =
             {"$":{"Name":serviceName},"StatefulService":[{"$":{"ServiceTypeName":serviceTypeName,"InstanceCount":"1"},"SingletonPartition":[""]}]};

      var builder = new xml2js.Builder();
      var xml = builder.buildObject(result);
          fs.writeFile(path.join(appPackage , appPackagePath, 'ApplicationManifest.xml'), xml, function(err) {
            if(err) {
                return console.log(err);
            }
          }); 
        });
      });
    }
    if (is_Linux){
      this.fs.copyTpl(
        this.templatePath('service/app/appPackage/servicePackage/Code/entryPoint.sh'),
        this.destinationPath(path.join(appPackage , appPackagePath, servicePackage, 'Code', 'entryPoint.sh')),
        {
          serviceProjName : serviceProjName
        } 
      );
      this.fs.copyTpl(
        this.templatePath('main/common/dotnet-include.sh'),
        this.destinationPath(path.join(appPackage, appPackagePath, servicePackage, 'Code', 'dotnet-include.sh')),
        {
        }
      );
    }
    this.fs.copyTpl(
      this.templatePath('service/app/appPackage/servicePackage/Config/Settings.xml'),
      this.destinationPath(path.join(appPackage , appPackagePath, servicePackage, 'Config', 'Settings.xml')),
      {
        serviceName: serviceName
      } 
    );

    this.fs.copyTpl(
      this.templatePath('service/class/ServiceImpl.cs'),
      this.destinationPath(path.join(appPackage , 'src' , serviceSrcPath ,  this.serviceName + '.cs')),
      {
        serviceName: serviceName,
        serviceName: this.serviceName,
        appName: appName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('service/class/project.csproj'),
      this.destinationPath(path.join(appPackage , 'src' , serviceSrcPath , this.serviceName + '.csproj')),
      {
        serviceName: this.serviceName,
        authorName: this.props.authorName
      } 
    );
     this.fs.copyTpl(
      this.templatePath('service/class/Program.cs'),
      this.destinationPath(path.join(appPackage , 'src' , serviceSrcPath , 'Program.cs')),
      {
        serviceName: this.serviceName,
        authorName: this.props.authorName,
        appName: appName,
        serviceTypeName : serviceTypeName
      } 
    );
     this.fs.copyTpl(
      this.templatePath('service/class/ServiceEventSource.cs'),
      this.destinationPath(path.join(appPackage , 'src' , serviceSrcPath , 'ServiceEventSource.cs')),
      {
        serviceName: this.serviceName,
        authorName: this.props.authorName,
        appName: appName,
        serviceTypeName : serviceTypeName
      }
    );

     if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('main/deploy/deploy'+ sdkScriptExtension),
        this.destinationPath(path.join(appPackage, 'install'+sdkScriptExtension)),
        {
          appPackage: appPackage,
          appName: appName,
          appTypeName: appTypeName
        } 
      );
    }
      
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('main/deploy/un-deploy'+sdkScriptExtension),
        this.destinationPath(path.join(appPackage, 'uninstall'+sdkScriptExtension)),
        {
          appPackage: appPackage,
          appName: appName,
          appTypeName: appTypeName
        } 
      );
    }
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('main/build/build'+ buildScriptExtension),
        this.destinationPath(path.join(appPackage, 'build'+buildScriptExtension)),
        {
          serviceProject: serviceProject,
          codePath: codePath,
       
        } 
      );
    }
    else {
        var nodeFs = require('fs');
        var appendToSettings = null;
        if (is_Linux || is_mac) {
          var appendToSettings  = '\n\
          \ndotnet restore $DIR/../' + serviceProject+ ' -s https://api.nuget.org/v3/index.json \
          \ndotnet build $DIR/../'+serviceProject+ ' -v normal\
          \ncd ' + '`' + 'dirname $DIR/../'+serviceProject + '`' +
          '\ndotnet publish -o ../../../../' +  appName + '/' + appName + '/' + servicePackage +'/Code\
          \ncd -';
        }
        else if (is_Windows) {
          var appendToSettings = '\n\
          \ndotnet restore %~dp0\\..\\' + serviceProject+ ' -s https://api.nuget.org/v3/index.json \
          \ndotnet build %~dp0\\..\\'+serviceProject+ ' -v normal\
          \nfor %%F in ("'+serviceProject+'") do cd %%~dpF\
          \ndotnet publish -o %~dp0\\..\\' + appName + '\\' + appName + '\\' + servicePackage +'\\Code';
        }
        nodeFs.appendFile(path.join(appPackage, 'build' + buildScriptExtension), appendToSettings, function (err) {
         if(err) {
              return console.log(err);
          }
      });
    }
    if (is_Linux) {
      if ( this.isAddNewService == false ) {
        this.fs.copyTpl(
          this.templatePath('main/common/dotnet-include.sh'),
          this.destinationPath(path.join(appPackage, 'dotnet-include.sh')),
          {
          }
        );
      }
    }
    this.template('service/app/appPackage/servicePackage/Config/_readme.txt', path.join(appPackage , appPackagePath, servicePackage, 'Config', '_readme.txt'));
    this.template('service/app/appPackage/servicePackage/Data/_readme.txt', path.join(appPackage , appPackagePath, servicePackage, 'Data', '_readme.txt'));
  } 
});

module.exports = ClassGenerator;

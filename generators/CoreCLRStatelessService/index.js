'use strict';

var path   = require('path')
, generators = require('yeoman-generator');

var ClassGenerator = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
    
    this.desc('Generate Stateless Service application template');
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
        this.packageName = "statelessservice";
        this.serviceFQN = "statelessservice." + this.serviceFQN;
        this.dir = this.dir + "/statelessservice";
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
    var serviceSrcPath = this.isAddNewService == false ? path.join(this.props.projName, serviceProjName) : path.join(this.props.projName, serviceProjName) ;
    appPackagePath = appName;

    var serviceProject = path.join(appPackage , 'src' , serviceSrcPath , serviceProjName + '.csproj');
    var codePath = path.join(appPackage , appPackagePath, servicePackage, 'Code');

    this.fs.copyTpl(
      this.templatePath('service/app/appPackage/servicePackage/ServiceManifest.xml'),
      this.destinationPath(path.join(appPackage , appPackagePath, servicePackage, 'ServiceManifest.xml')),
      {
        servicePackage: servicePackage,
        serviceTypeName: serviceTypeName,
        serviceName: serviceName
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
             {"$":{"Name":serviceName},"StatelessService":[{"$":{"ServiceTypeName":serviceTypeName,"InstanceCount":"1"},"SingletonPartition":[""]}]};

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
      this.templatePath('service/class/ServiceEventListener.cs'),
      this.destinationPath(path.join(appPackage , 'src' , serviceSrcPath , 'ServiceEventListener.cs')),
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
        this.templatePath('main/deploy/deploy.sh'),
        this.destinationPath(path.join(appPackage, 'install.sh')),
        {
          appPackage: appPackage,
          appName: appName,
          appTypeName: appTypeName
        } 
      );
    }
    else{
      var nodeFs = require('fs');

    }
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('main/deploy/un-deploy.sh'),
        this.destinationPath(path.join(appPackage, 'uninstall.sh')),
        {
          appPackage: appPackage,
          appName: appName,
          appTypeName: appTypeName
        } 
      );
    }
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('main/build/build.sh'),
        this.destinationPath(path.join(appPackage, 'build.sh')),
        {
          serviceProject: serviceProject,
          codePath: codePath,
       
        } 
      );
    }
    else {
        var nodeFs = require('fs');
        var appendToSettings  = '\n\
        \ndotnet restore $DIR/../' + serviceProject+ ' -s https://api.nuget.org/v3/index.json \
        \ndotnet build $DIR/../'+serviceProject+ ' -v normal\
        \ncd ' + '`' + 'dirname $DIR/../'+serviceProject + '`' +
        '\ndotnet publish -o $CURDIR/../' +  appName + '/' + appName + '/' + servicePackage +'/Code\
        \ncd -';
        nodeFs.appendFile(path.join(appPackage, 'build.sh'), appendToSettings, function (err) {
         if(err) {
              return console.log(err);
          }
      });
    }
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('main/common/dotnet-include.sh'),
        this.destinationPath(path.join(appPackage, 'dotnet-include.sh')),
        {
        }
      );
    }
    this.template('service/app/appPackage/servicePackage/Config/_readme.txt', path.join(appPackage , appPackagePath, servicePackage, 'Config', '_readme.txt'));
    this.template('service/app/appPackage/servicePackage/Data/_readme.txt', path.join(appPackage , appPackagePath, servicePackage, 'Data', '_readme.txt'));
  } 
});

module.exports = ClassGenerator;

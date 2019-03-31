'use strict';

var path   = require('path')
, generators = require('yeoman-generator');

var ClassGenerator = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
    
    this.desc('Generate Stateful Actor application template');
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
      , name: 'actorFQN'
      , message: 'Enter the name of actor service : '
      , validate: function (input) {
        return input ? utility.validateFQN(input) : false;
      }
    }];
    
    this.prompt(prompts, function(input) {
      this.actorFQN = input.actorFQN;
      var parts = this.actorFQN.split('.')
      , name  = parts.pop();
      this.packageName = parts.join('.');
      this.dir = parts.join('/');
      this.actorName = utility.capitalizeFirstLetter(name.trim());
      if (!this.packageName) {
        this.packageName = "statefulactor";
        this.actorFQN = "statefulactor." + this.actorFQN;
        this.dir = this.dir + "/statefulactor";
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
    var serviceProjName = this.actorName + 'Service';
    var testClientProjName = this.actorName + 'TestClient';

    var actorInterfaceName = 'I' + this.actorName;
    var interfaceProjName = this.actorName + '.Interfaces';
    var actorInterfaceNamespace  = this.actorName + '.Interfaces';

    var appPackage = this.props.projName;
    var servicePackage = this.actorName + 'Pkg';
    var serviceName = this.actorName   ;
    var serviceTypeName = this.actorName + 'Type';
    var appTypeName = this.props.projName + 'Type';
    var appName = this.props.projName;
    
    var serviceJarName = (this.actorName).toLowerCase();
    var interfaceJarName = (this.actorName + '-interface').toLowerCase();
    var testClientJarName = (this.actorName + '-test').toLowerCase();
    
    var testClassName = this.actorName + 'TestClient';
    var serviceMainClass = this.actorName + 'Service';
    var endpoint = serviceName + 'Endpoint';
    var replicatorEndpoint = serviceName + 'ReplicatorEndpoint';
    var replicatorConfig = serviceName + 'ReplicatorConfig';
    var replicatorSecurityConfig = serviceName + 'ReplicatorSecurityConfig';
    var localStoreConfig = serviceName + 'LocalStoreConfig';
 
    var appPackagePath = this.isAddNewService == false ? path.join(this.props.projName, appPackage) :  appPackage;
    var serviceSrcPath = path.join(this.props.projName, serviceProjName) ;
    var interfaceSrcPath = path.join(this.props.projName, interfaceProjName);
    var testClientSrcPath = path.join(this.props.projName, testClientProjName);
    appPackagePath = appName;

    var testProject =  	path.join(appPackage , 'src' , testClientSrcPath , testClientProjName + '.csproj');
    var interfaceProject = path.join(appPackage , 'src' , interfaceSrcPath , interfaceProjName + '.csproj');
    var serviceProject = path.join(appPackage , 'src' , serviceSrcPath , serviceProjName + '.csproj');
    var codePath = path.join(appPackage , appPackagePath, servicePackage, 'Code');
    var testCodePath = path.join(appPackage , serviceProjName + 'TestClient' );

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
    else{
      sdkScriptExtension = '.sh';
      buildScriptExtension = '.sh';
    }
    if (is_Linux)  serviceManifestFile = 'ServiceManifest_Linux.xml';
    if (is_mac)    serviceManifestFile = 'ServiceManifest.xml';

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
      fs.readFile(path.join(appPackage,appPackagePath, 'ApplicationManifest.xml'), function(err, data) {
      parser.parseString(data, function (err, result) {
          if (err) {
              return console.log(err);
          }
          result['ApplicationManifest']['ServiceManifestImport'][result['ApplicationManifest']['ServiceManifestImport'].length] = 
              {"ServiceManifestRef":[{"$":{"ServiceManifestName":servicePackage,"ServiceManifestVersion":"1.0.0"}}]}
          result['ApplicationManifest']['DefaultServices'][0]['Service'][result['ApplicationManifest']['DefaultServices'][0]['Service'].length] = 
              {"$":{"Name":serviceName},"StatefulService":[{"$":{"ServiceTypeName":serviceTypeName,"TargetReplicaSetSize":"3","MinReplicaSetSize":"2"},"UniformInt64Partition":[{"$":{"PartitionCount":"1","LowKey":"-9223372036854775808","HighKey":"9223372036854775807"}}]}]};
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

    if (is_Linux) {
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
      this.templatePath('interface/ActorInterface.cs'),
      this.destinationPath(path.join(appPackage , 'src' , interfaceSrcPath ,  'I' +this.actorName + '.cs')),
      {
        actorInterfaceNamespace: this.actorName +'.Interfaces',
        actorInterfaceName: 'I' +this.actorName ,
        authorName: this.props.authorName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('interface/project.csproj'),
      this.destinationPath(path.join(appPackage , 'src' , interfaceSrcPath , interfaceProjName + '.csproj')),
      {
        actorName: this.actorName,
        authorName: this.props.authorName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('service/class/ActorImpl.cs'),
      this.destinationPath(path.join(appPackage , 'src' , serviceSrcPath ,  this.actorName + '.cs')),
      {
        actorInterfaceNamespace: this.actorName +'.Interfaces',
        actorInterfaceName: 'I' +this.actorName ,
        serviceName: serviceName,
        actorName: this.actorName,
        appName: appName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('service/class/project.csproj'),
      this.destinationPath(path.join(appPackage , 'src' , serviceSrcPath , serviceProjName + '.csproj')),
      {
        actorInterfaceNamespace: this.actorName +'.Interfaces',
        actorInterfaceName: 'I' +this.actorName ,
        actorName: this.actorName,
        authorName: this.props.authorName
      } 
    );
     this.fs.copyTpl(
      this.templatePath('service/class/Program.cs'),
      this.destinationPath(path.join(appPackage , 'src' , serviceSrcPath , 'Program.cs')),
      {
        actorName: this.actorName,
        authorName: this.props.authorName,
        appName: appName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('service/class/ActorImpl.cs'),
      this.destinationPath(path.join(appPackage , 'src' , serviceSrcPath ,  this.actorName + '.cs')),
      {
        actorInterfaceNamespace: this.actorName +'.Interfaces',
        actorInterfaceName: 'I' +this.actorName ,
        serviceName: serviceName,
        actorName: this.actorName,
        appName: appName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('service/class/Program.cs'),
      this.destinationPath(path.join(appPackage , 'src' , serviceSrcPath , 'Program.cs')),
      {
        actorName: this.actorName,
        authorName: this.props.authorName,
        appName: appName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('testclient/class/project.csproj'),
      this.destinationPath(path.join(appPackage , 'src' , testClientSrcPath , testClientProjName + '.csproj')),
      {
        actorInterfaceNamespace: this.actorName +'.Interfaces',
        actorInterfaceName: 'I' +this.actorName ,
        authorName: this.props.authorName,
        actorName: this.actorName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('testclient/class/Program.cs'),
      this.destinationPath(path.join(appPackage , 'src' , testClientSrcPath ,  'Program.cs')),
      {
        actorInterfaceNamespace: this.actorName +'.Interfaces',
        actorInterfaceName: 'I' + this.actorName ,
        actorName: this.actorName,
        serviceName: serviceName,
        appName: appName
      } 
    );
    this.fs.copyTpl(
      this.templatePath('service/class/ActorEventListener.cs'),
      this.destinationPath(path.join(appPackage , 'src' , serviceSrcPath , 'ActorEventListener.cs')),
      {
        actorName: this.actorName,
        authorName: this.props.authorName,
        appName: appName
      }
    );
    this.fs.copyTpl(
      this.templatePath('service/class/ActorEventSource.cs'),
      this.destinationPath(path.join(appPackage , 'src' , serviceSrcPath , 'ActorEventSource.cs')),
      {
        actorName: this.actorName,
        authorName: this.props.authorName,
        appName: appName
      }
    );
    this.fs.copyTpl(
      this.templatePath('testclient/testscripts/testclient'+buildScriptExtension),
      this.destinationPath(path.join(appPackage , serviceProjName + 'TestClient' , 'testclient'+buildScriptExtension)),
      {
        testClientProjName: testClientProjName,
        fabricCodePath: (is_mac ? "/home/FabricDrop/bin/Fabric/Fabric.Code" : "/opt/microsoft/servicefabric/bin/Fabric/Fabric.Code/")
      }
    );
    if (is_Linux) {
      this.fs.copyTpl(
        this.templatePath('main/common/dotnet-include.sh'),
        this.destinationPath(path.join(appPackage , serviceProjName + 'TestClient' , 'dotnet-include.sh')),
        {
        }
      );
    }
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('main/deploy/deploy'+sdkScriptExtension),
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
    if ( this.isAddNewService == false) {
      this.fs.copyTpl(
        this.templatePath('main/deploy/upgrade'+sdkScriptExtension),
        this.destinationPath(path.join(appPackage, 'upgrade'+sdkScriptExtension)),
        {
          appPackage: appPackage,
          appName: appName,
          appTypeName: appTypeName
        }
      );
    }
    if ( this.isAddNewService == false ) {
      this.fs.copyTpl(
        this.templatePath('main/build/build'+buildScriptExtension),
        this.destinationPath(path.join(appPackage, 'build'+buildScriptExtension)),
        {
          testProject: testProject,
          interfaceProject : interfaceProject ,
          serviceProject: serviceProject,
          codePath: codePath,
          testCodePath : testCodePath
          
        } 
      );
    }
    else {
        var nodeFs = require('fs');
        var appendToSettings = null;
        if (is_Linux || is_mac) {
          var appendToSettings  = '\n\
          \ndotnet restore $DIR/../'+ interfaceProject+ ' -s https://api.nuget.org/v3/index.json  \
          \ndotnet build $DIR/../'+interfaceProject+' -v normal\n \n \
          \ndotnet restore $DIR/../'+serviceProject+' -s https://api.nuget.org/v3/index.json \
          \ndotnet build $DIR/../'+serviceProject+' -v normal\
          \ndotnet publish $DIR/../'+serviceProject+' -o ../../../../'+codePath+'\n\n\
          \ndotnet restore $DIR/../'+testProject+' -s https://api.nuget.org/v3/index.json \
          \ndotnet build $DIR/../'+testProject+' -v normal\
          \ncd ' + '`' + 'dirname $DIR/../'+testProject + '`' +
          '\ndotnet publish -o ../../../../' +  appName + '/'+ serviceProjName +'TestClient\
          \ncd -';
        }
        else if (is_Windows) {
          var appendToSettings = '\n\
          \ndotnet restore %~dp0\\..\\'+ interfaceProject+ ' -s https://api.nuget.org/v3/index.json  \
          \ndotnet build %~dp0\\..\\'+interfaceProject+' -v normal\n \n \
          \ndotnet restore %~dp0\\..\\' + serviceProject+ ' -s https://api.nuget.org/v3/index.json \
          \ndotnet build %~dp0\\..\\'+serviceProject+ ' -v normal\
          \ndotnet publish %~dp0\\..\\'+serviceProject+' -o %~dp0\\..\\'+codePath+'\n\n\
          \ndotnet restore %~dp0\\..\\'+testProject+' -s https://api.nuget.org/v3/index.json \
          \ndotnet build %~dp0\\..\\'+testProject+' -v normal\
          \nfor %%F in ("'+testProject+'") do cd %%~dpF\
          \ndotnet publish -o %~dp0\\..\\' + appName + '\\' + serviceProjName +'TestClient\
          \ncd %~dp0\..';
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

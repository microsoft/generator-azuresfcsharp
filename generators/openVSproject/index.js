var path=require('path');
var fs=require('fs');


generators = require('yeoman-generator');
 console.log('Initialising VS project for VScode');
var ClassGenerator = generators.Base.extend({
 
    scriptbuilding: function(){

var data=path.join(process.cwd(),'vscode-config.json');
var words=fs.readFileSync(data);
var tst=JSON.parse(words);

        var appPackage = tst.appname;
        var appTypeName =tst.appname+ 'Type';
        var appName = tst.appname;
        var noofservices=tst.numofservices;
       var flag=new Array();
        
        
   
        
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

    if(noofservices)
    {
      var i;
      
      /* this.fs.copyTpl(
        this.templatePath('main/build/build'+buildScriptExtension),
        this.destinationPath(path.join(process.cwd(),'build'+buildScriptExtension)),
        {
          serviceProject: path.join(process.cwd(),appPackage ,tst.serviceProjName[0] ,tst.serviceProjName[0] + '.csproj'),
          codePath: path.join(process.cwd(),appPackage , appPackage ,'pkg' ,'debug' ,tst.servicePackage[0] , 'Code')
        
        } 
      );*/
      
    
      /*for(i=0;i<noofservices;i++)
      {
        console.log('inside');
        fs.copyFile(path.join(appName,tst.serviceProjName[i],'PackageRoot','Config'),path.join(appName,appName,appName,tst.servicePackage[i],'Config'),(err)=>
        {
          if (err) throw err;
          console.log('copy success');
        }
        );
        fs.copyFile(path.join(process.cwd(),tst.appname,'ApplicationPackageRoot','ApplicationManifest.xml'), path.join(process.cwd(),tst.appname,tst.appname,'ApplicationManifest.xml'), (err) => {
          if (err) throw err;
         console.log('copy success');
        });
      }*/
      for(i=0;i<noofservices;i++)
       {
        
         
         var serviceProject=path.join(appPackage ,tst.services[i].serviceProjName ,tst.services[i].serviceProjName + '.csproj');
        var servicePackage=tst.services[i].servicePackage;
        var serviceProjName=tst.services[i].serviceProjName;
        var nodeFs = require('fs');
        var appendToSettings = null;
        if (is_Linux || is_mac) {
          var appendToSettings  = '\n\
          \ndotnet restore $DIR/../' + serviceProject+ ' -s https://api.nuget.org/v3/index.json \
          \ndotnet build $DIR/../'+serviceProject+ ' -v normal\
          \ncd ' + '`' + 'dirname $DIR/../'+serviceProject + '`' +
          '\ndotnet publish -o ../../../../' +  appName + '/' + serviceProjName + '/' + 'PackageRoot'+'/Code\
          \ncd -';
        }
        else if (is_Windows) {
          var appendToSettings = '\n\
          \ndotnet restore %~dp0\\..\\' + serviceProject+ ' -s https://api.nuget.org/v3/index.json \
          \ndotnet build %~dp0\\..\\'+serviceProject+ ' -v normal\
          \nfor %%F in ("../'+serviceProject+'") do cd %%~dpF\
          \ndotnet publish -o %~dp0\\..\\' + appName + '\\' + serviceProjName +'\\PackageRoot'+'\\Code\
          \ncd ..';
        }
        
        
        
        nodeFs.appendFileSync(path.join(process.cwd(), 'build'+buildScriptExtension), appendToSettings, function (err) {
          if(err) {
              return console.log(err);
          }
        
      });
      if(i==0){
      var txt4='\n'+'mkdir'+' '+path.join(process.cwd(),appName,appName);
        nodeFs.appendFileSync(path.join(process.cwd(), 'build'+buildScriptExtension), txt4, function (err) {
          if(err) {
              return console.log(err);
          }
        
      });
    }
     
      /*  var path1= path.join(process.cwd(),appName,'ApplicationPackageRoot','ApplicationManifest.xml');

      
      
        var path2= path.join(process.cwd(),appName,appName,'ApplicationManifest.xml');
      
      var txt='\n'+'copy' +' ' + path1 + ' '+ path2;
      fs.appendFileSync(path.join(process.cwd(),'build'+buildScriptExtension),txt,function(err){
if(err)
return console.log(err);
console.log('copy success');

      })*/
      
        var p1=path.join(process.cwd(),tst.services[i].serviceProjName,'PackageRoot','*');
        var p11=path.join(process.cwd(),appName,appName,tst.services[i].servicePackage);
       
        var txt1='\n'+'xcopy'+' '+'/Y'+' '+p1+' '+p11 +' ' +'/s'+' '+'/i';
       

        fs.appendFileSync(path.join(process.cwd(),'build'+buildScriptExtension),txt1,function(err){
if(err)
return console.log(err);

        })
                      
     


       }
      
   
      this.fs.copyTpl(
        this.templatePath('../../utilityscripts/main/deploy/deploy'+sdkScriptExtension),
        this.destinationPath(path.join(process.cwd(), 'install'+sdkScriptExtension)),
        {
          appPackage: appPackage,
          appName: appName,
          appTypeName: appTypeName,
         
        } 
      );
      this.fs.copyTpl(
        this.templatePath('../../utilityscripts/main/deploy/upgrade'+sdkScriptExtension),
        this.destinationPath(path.join(process.cwd(), 'upgrade'+sdkScriptExtension)),
        {
          appPackage: appPackage,
          appName: appName,
          appTypeName: appTypeName
        }
      );
      this.fs.copyTpl(
        this.templatePath('../../utilityscripts/main/deploy/un-deploy'+sdkScriptExtension),
        this.destinationPath(path.join(process.cwd(), 'uninstall'+sdkScriptExtension)),
        {
          appPackage: appPackage,
          appName: appName,
          appTypeName: appTypeName
        } 
      );
    }

   
}

});
module.exports = ClassGenerator;
'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var mkdirp = require('mkdirp');
var wiredep = require('wiredep');
var _s = require('underscore.string');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.Base.apply(this, arguments);
    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });
    this.option('skip-dependencies', {
      desc: 'Skips dependency installation',
      type: Boolean
    });
  },

  initializing: function () {
    this.pkg = require('../../package.json');
  },

  prompting: function() {
    var done = this.async();
    if (!this.options['skip-welcome-message']) {
      this.log(yosay('Let\'s blow on the Orange Flame, shall we?'));
    }
    var prompts = [{
      name: 'appName',
      message: 'What is your app\'s name ?'
    }];
    this.prompt(prompts, function(props) {
      this.appName = props.appName;
      done();
    }.bind(this));
  },

  scaffoldFolders: function() {
    this.log(chalk.blue.bold('Creating Folders...'));
    mkdirp("app");
    mkdirp("app/styles");
    mkdirp("app/styles/partials");
    mkdirp("app/js");
    mkdirp("app/images");
    mkdirp("app/templates");
    mkdirp("app/templates/includes");
    mkdirp("build");
    mkdirp("dist");
  },

  copyMainFiles: function() {
    this.log(chalk.blue.bold('Copying Files...'));
    this.fs.copy(
      this.templatePath("_components.scss"),
      this.destinationPath("app/styles/partials/_components.scss"));
    this.fs.copy(
      this.templatePath("_doormat.scss"),
      this.destinationPath("app/styles/partials/_doormat.scss"));
    this.fs.copy(
      this.templatePath("_layout.scss"),
      this.destinationPath("app/styles/partials/_layout.scss"));
    this.fs.copy(
      this.templatePath("_mixins.scss"),
      this.destinationPath("app/styles/partials/_mixins.scss"));
    this.fs.copy(
      this.templatePath("_nav.scss"),
      this.destinationPath("app/styles/partials/_nav.scss"));
    this.fs.copy(
      this.templatePath("_shame.scss"),
      this.destinationPath("app/styles/partials/_shame.scss"));
    this.fs.copy(
      this.templatePath("_type.scss"),
      this.destinationPath("app/styles/partials/_type.scss"));
    this.fs.copy(
      this.templatePath("_variables.scss"),
      this.destinationPath("app/styles/partials/_variables.scss"));
    this.fs.copy(
      this.templatePath("_main.scss"),
      this.destinationPath("app/styles/main.scss"));
    this.fs.copy(
      this.templatePath("_doormat.twig"),
      this.destinationPath("app/templates/includes/_doormat.twig"));
    this.fs.copy(
      this.templatePath("_nav.twig"),
      this.destinationPath("app/templates/includes/_nav.twig"));
    this.fs.copy(
      this.templatePath("_main.js"),
      this.destinationPath("app/js/main.js"));
    this.fs.copy(
      this.templatePath("gitignore"),
      this.destinationPath(".gitignore"));

    var context = {
      site_name: this.appName,
      site_slug: _s.slugify(this.appName),
      site_version: '1.0.0'
    };

    this.fs.copyTpl(
      this.templatePath("_layout.twig"),
      this.destinationPath("app/templates/includes/_layout.twig"),
      context);

    this.fs.copyTpl(
      this.templatePath("_index.twig"),
      this.destinationPath("app/templates/index.twig"),
      context);

    this.fs.copyTpl(
      this.templatePath("_package.json"),
      this.destinationPath("package.json"),
      context);

    this.fs.copyTpl(
      this.templatePath("_gulpfile.js"),
      this.destinationPath("gulpfile.js"), {
        date: (new Date).toISOString().split('T')[0],
        name: this.pkg.name,
        version: this.pkg.version
      });
  },

  install: function() {
    if (!this.options['skip-dependencies']) {
      this.log(chalk.blue.bold('Installing Dependencies...'));
      this.installDependencies({
        skipMessage: true
      });
    }
  },

  end: function() {
    this.log(chalk.green.bold('Done.') + ' Don\'t forget to run ' + chalk.yellow.bold('gulp init') + ' before ' + chalk.yellow.bold('gulp serve') + ' in order to do a preliminary development build.');
  }
});

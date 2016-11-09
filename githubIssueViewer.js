var githubIssueViewerApp = angular.module('GithubIssueViewerApp', ['ngResource']);

githubIssueViewerApp.controller('GithubIssueViewerCtrl',
    function ($scope, Github) {
  $scope.userNameForm = {};
  $scope.userNameInput = '';
  $scope.vals = {
    userRepoDisplayHeading: '',
    repoIssuesDisplayHeading: '',
    issues: [],
    repos: [],
  };
  $scope.status = {
    acquiringUserRepos: false,
    acquiringRepoIssues: false,
    acquiringRepoIssuesError: false,
    invalidGithubUser: false,
  };

  function resetUserandRepos() {
    $scope.vals.userRepoDisplayHeading = '';
    $scope.vals.repoIssuesDisplayHeading = '';
    $scope.vals.repos = [];
    $scope.vals.issues = [];
    $scope.status.invalidGithubUser = false;
    $scope.status.acquiringRepoIssuesError = false;
  }

  $scope.updateUser = function() {
    resetUserandRepos();
    $scope.userNameForm.submitted = true;
    if (!$scope.userNameInput) {return;}

    $scope.status.acquiringUserRepos = true;
    Github.repos({user: $scope.userNameInput}).$promise.then(function(repos) {
      $scope.vals.repos = repos;
      $scope.vals.userRepoDisplayHeading = $scope.userNameInput + '\'s repositories';
      $scope.userNameForm.submitted = false;
    }).catch(function() {
      $scope.status.invalidGithubUser = true;
      console.error('Cannot acquire repos. User ' + $scope.userNameInput + ' may not be valid');
    }).finally(function() {
      $scope.status.acquiringUserRepos = false;
    });
  };

  $scope.selectRepo = function(repoName) {
    $scope.status.acquiringRepoIssues = true;
    $scope.status.acquiringRepoIssuesError = false;
    Github.issues({user: $scope.userNameInput, repository: repoName}).$promise.then(function(issues) {
      $scope.vals.issues = issues;
      $scope.vals.repoIssuesDisplayHeading = repoName + ' issues';
    }).catch(function() {
      $scope.status.acquiringRepoIssuesError = true;
      console.error('Cannot acquire issues for repo ' + repoName);
    }).finally(function() {
      $scope.status.acquiringRepoIssues = false;
    });
  };
});


githubIssueViewerApp.factory('Github',
    function ($resource) {
  var GITHUB_ROOT_URL = 'https://api.github.com';
  return $resource(GITHUB_ROOT_URL, {
      format: 'json'
    }, {
      repos: {
        method: 'GET',
        params:{charge:true},
        url: GITHUB_ROOT_URL + '/users/:user/repos', //{?type,page,per_page,sort}'
        user: '@user',
        isArray: true,
      },
      issues: {
        method: 'GET',
        url: GITHUB_ROOT_URL + '/repos/:user/:repository/issues',
        user: '@user',
        repository: '@repository',
        isArray: true,
      }
   });
});

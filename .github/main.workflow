workflow "Deploy" {
  resolves = [
    "Deply"
  ]
  on = "push"
}


action "Deply" {
  uses = "./.github/action-deploy"
  env = {
    RENDER_BRANCH = "master"
  }
  secrets = ["GIT_DEPLOY_KEY"]
}
workflow "Deploy" {
  resolves = [
    "Deploy branch master"
  ]
  on = "push"
}

action "Deploy branch master" {
  uses = "./.github/action-deploy"
  env = {
    RENDER_BRANCH = "render"
    CNAME = "blog.sigoden.com"
  }
  secrets = ["GIT_DEPLOY_KEY"]
}

workflow "Deploy" {
  resolves = [
    "Deploy"
  ]
  on = "push"
}

action "Deploy" {
  uses = "./.github/action-deploy"
  env = {
    RENDER_BRANCH = "render"
    CNAME = "blog.sigoden.com"
  }
  secrets = ["GIT_DEPLOY_KEY"]
}

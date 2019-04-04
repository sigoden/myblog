workflow "Deploy" {
  resolves = [
    "Deploy branch render"
  ]
  on = "push"
}

action "Deploy branch render" {
  uses = "./.github/action-deploy"
  env = {
    RENDER_BRANCH = "render"
    CNAME = "blog.sigoden.com"
  }
  secrets = ["GIT_DEPLOY_KEY"]
}

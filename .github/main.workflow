workflow "Build & Deploy: masater" {
  resolves = [
    "Deply: push master"
  ]
  on = "push"
}

workflow "Build & Deploy: render" {
  resolves = [
    "Deply: push render"
  ]
  on = "push"
}

action "Deply: push master" {
  uses = "./.github/action-deploy"
  env = {
    RENDER_BRANCH = "render"
    CNAME = "blog.sigoden.com"
  }
  secrets = ["GIT_DEPLOY_KEY"]
  needs = ["Filters: push master"]
}

action "Deply: push render" {
  uses = "./.github/action-deploy"
  env = {
    RENDER_BRANCH = "render"
    CNAME = "blog.sigoden.com"
  }
  secrets = ["GIT_DEPLOY_KEY"]
  needs = ["Filters: push render"]
}

action "Filters: push render" {
  uses = "actions/bin/filter@3c98a2679187369a2116d4f311568596d3725740"
  args = "branch render"
}

action "Filters: push master" {
  uses = "actions/bin/filter@3c98a2679187369a2116d4f311568596d3725740"
  args = "branch master"
}

workflow "Build & Deploy: masater" {
  resolves = [
    "Deply: push master"
  ]
  on = "push"
}

workflow "Build & Deploy: use-githubtoken" {
  resolves = [
    "Deply: push use-githubtoken"
  ]
  on = "push"
}

action "Deply: push master" {
  uses = "./.github/action-deploy"
  env = {
    RENDER_BRANCH = "render"
    CNAME = "blog.sigoden.com"
  }
  secrets = ["GITHUB_TOKEN"]
  needs = ["Filters: push master"]
}

action "Deply: push use-githubtoken" {
  uses = "./.github/action-deploy"
  env = {
    RENDER_BRANCH = "use-githubtoken"
    CNAME = "blog.sigoden.com"
  }
  secrets = ["GITHUB_TOKEN"]
  needs = ["Filters: push use-githubtoken"]
}

action "Filters: push use-github-token" {
  uses = "actions/bin/filter@3c98a2679187369a2116d4f311568596d3725740"
  args = "branch render"
}

action "Filters: push master" {
  uses = "actions/bin/filter@3c98a2679187369a2116d4f311568596d3725740"
  args = "branch master"
}

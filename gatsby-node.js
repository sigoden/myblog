const path = require(`path`)
const _ = require('lodash')
const parseFilepath = require(`parse-filepath`)

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  const blogPostTemplate = path.resolve('./src/templates/blog-post.js')
  const blogTagTemplate = path.resolve('./src/templates/blog-tag.js')

  return graphql(`
    {
      allMarkdownRemark (
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 2000
      ) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
              draft
              tags
            }
          }
        }
      }
    }
  `
  ).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors)
    }

    let posts = result.data.allMarkdownRemark.edges

    if (process.env.NODE_ENV === `production`) {
      posts = posts.filter(edge => !edge.node.frontmatter.draft)
    }

    posts.forEach(({ node }, index) => {
      const next = index === 0 ? false : posts[index - 1].node
      const prev = index === posts.length - 1 ? false : posts[index + 1].node
      createPage({
        path: node.fields.slug,
        component: blogPostTemplate,
        context: {
          slug: node.fields.slug,
          prev,
          next,
        },
      })
    })

    let tags = [];
    _.each(posts, edge => {
      if (_.get(edge, 'node.frontmatter.tags')) {
        tags = tags.concat(edge.node.frontmatter.tags);
      }
    })

    tags = _.uniq(tags)

    tags.forEach(tag => {
      createPage({
        path: `/tags/${_.kebabCase(tag)}/`,
        component: blogTagTemplate,
        context: {
          tag,
        },
      })
    })

  })
}


exports.onCreateNode = ({ node, boundActionCreators, getNode }) => {
  const { createNodeField } = boundActionCreators
  if (
    node.internal.type === `MarkdownRemark` &&
    getNode(node.parent).internal.type === `File`
  ) {

    let slug
    const fileNode = getNode(node.parent)
    const parsedFilePath = parseFilepath(fileNode.relativePath)
    // Add slugs for docs pages
    if (fileNode.sourceInstanceName === `blogs`) {
      if (node.frontmatter.slug) {
        let _slug = node.frontmatter.slug
        _slug = _slug.startsWith('/') ? _slug.slice(1) : _slug
        _slug = _slug.endsWith('/') ? _slug.slice(0, -1) : _slug
        slug = `/${_slug}/`
      } else {
        if (parsedFilePath.name === `index`) {
          slug = `/${parsedFilePath.dir}/`
        } else if (parsedFilePath.dir === ``) {
          slug = `/${parsedFilePath.name}/`
        } else {
          slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`
        }
      }
    }

    createNodeField({ node, name: `slug`, value: slug })
  }
}

exports.modifyWebpackConfig = ({ config, stage }) => {
  if (process.env.NODE_ENV === 'production') {
    config.merge({devtool: false})
  }
}

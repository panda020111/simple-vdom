import { Type } from './patch.js'
import _ from './util.js'
import list_diff from 'list-diff2'

function diff (oldTree, newTree) {
  const index = 0
  const patches = {}
  dfsWalk(oldTree, newTree, index, patches)
  return patches
}

function dfsWalk (oldNode, newNode, index, pathches) {
  let currentPatch = []

  if (newNode === null) {

  } else if (_.isString(oldNode) && _.isString(newNode)) {
    if (oldNode !== newNode) {
      currentPatch.push({type: Type.Text, content: newNode})
    }
  } else if (
    oldNode.tagName === newNode.tagName 
    && oldNode.key === newNode.key
  ) {
    const propsPatches = diffProps(oldNode, newNode)
    if (propsPatches) {
      currentPatch.push({type: Type.Props, content: newNode})
    }

    diffChildren(oldNode.children, newNode.children, index, pathches, currentPatch)
  } else {
    currentPatch.push({ type: patch.REPLACE, node: newNode })
  }

  if (currentPatch.length) {
    pathches[index] = currentPatch
  }
}

function diffChildren(oldChildren, newChildren, index, patches, currentPatch) {
  const diffs = listDiff(oldChildren, newChildren, 'key')
  newChildren = diffs.children

  if (diff.moves.length) {
    const reorderPatch = {type: Type.Reorder, moves: diff.moves}
    currentPatch.push(reorderPatch)
  }

  let leftNode = null
  let currentNodeIndex = index
  _.each(oldChildren, (child, i) => {
    let child = newChildren[i]
    currentNodeIndex = (leftNode && leftNode.count)
      ? currentNodeIndex + leftNode.count + 1
      : currentNodeIndex + 1
    dfsWalk(child, newChild, currentNodeIndex, patches)
    leftNode = child
  })
}

function diffProps (oldNode, newNode) {
  let count = 0
  const oldProps = oldNode.props
  const newProps = newNode.props

  let key, value
  let propsPatches = {}

  // Find out different properties
  for (key in oldProps) {
    value = oldProps[key]
    if (newProps[key] !== value) {
      count++
      propsPatches[key] = newProps[key]
    }
  }

  // Find out new property
  for (key in newProps) {
    value = newProps[key]
    if (!oldProps.hasOwnProperty(key)) {
      count++
      propsPatches[key] = newProps[key]
    }
  }

  // If properties all are identical
  if (count === 0) {
    return null
  }

  return propsPatches
}

const router = require('express').Router()
const {Problem, UserProblems, User, Stage} = require('../db/models')
module.exports = router

router.get('/', async (req, res, next) => {
  try {
    const problems = await Problem.findAll({})
    res.json(problems)
  } catch (err) {
    next(err)
  }
})

router.get('/solved/:userId', async (req, res, next) => {
  try {
    const solvedProblems = await UserProblems.findAll({
      where: {
        userId: req.params.userId
      }
    })
    let sortedSolvedProblems = {
      1: {problems: []},
      2: {problems: []},
      3: {problems: []}
    }
    for (let i = 0; i < solvedProblems.length; i++) {
      let problem = solvedProblems[i]
      let prob = await Problem.findById(problem.problemId)
      if (sortedSolvedProblems[prob.stageId]) {
        sortedSolvedProblems[prob.stageId].problems.push(problem)
      } else {
        sortedSolvedProblems[prob.stageId] = {problems: [problem]}
      }
    }
    // const user = await User.findById(req.params.userId)
    // const stage = await Stage.findById(user.stageId)
    // if (stage.goal === sortedSolvedProblems[user.stageId].problems.length) {
    //   sortedSolvedProblems[user.stageId].complete = true
    // } else {
    //   sortedSolvedProblems[user.stageId].complete = false
    // }
    res.json(sortedSolvedProblems)
  } catch (err) {
    next(err)
  }
})
router.get('/:userId', async (req, res, next) => {
  try {
    // const singleProblem = await Problem.findById(req.params.id)
    // res.json(singleProblem)
    console.log('hit /:userId')
    let {problemId = ''} = req.query
    const user = await User.findById(req.params.userId)
    const solvedProblems = await UserProblems.findAll({
      where: {
        userId: req.params.userId
      }
    })
    const problems = await Problem.findAll().filter(problem => {
      let notSolved = true
      if (
        user.stageId !== problem.stageId ||
        problem.deleted ||
        problem.id === parseInt(problemId, 10)
      ) {
        notSolved = false
      }
      for (let i = 0; i < solvedProblems.length; i++) {
        if (solvedProblems[i].problemId === problem.id) {
          notSolved = false
        }
      }
      return notSolved
    })
    res.json(problems[Math.round(Math.random() * (problems.length - 1))])
  } catch (e) {
    next(e)
  }
})

router.post('/solved/:userId/:problemId', async (req, res, next) => {
  try {
    console.log('TCL: req.params', req.params)
    await UserProblems.create({
      userId: req.params.userId,
      problemId: req.params.problemId
    })
    res.end()
  } catch (err) {
    next(err)
  }
})

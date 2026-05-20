import { areaConnections } from './scenicData'

export class FlowSimulator {
  constructor(areas) {
    this.areas = JSON.parse(JSON.stringify(areas))
    this.isRunning = false
    this.simulationSpeed = 1
    this.holidayMode = false
    this.inflowRate = 50
    this.onUpdate = null
    this.intervalId = null
    this.visitorHistory = []
    this.timeStep = 0
  }

  setHolidayMode(enabled) {
    this.holidayMode = enabled
    this.inflowRate = enabled ? 150 : 50
  }

  setSpeed(speed) {
    this.simulationSpeed = speed
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.simulate()
  }

  stop() {
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  reset() {
    this.stop()
    this.areas.forEach(area => {
      area.currentVisitors = 0
    })
    this.visitorHistory = []
    this.timeStep = 0
    this.notifyUpdate()
  }

  simulate() {
    const tick = () => {
      if (!this.isRunning) return
      
      this.timeStep++
      
      const incomingVisitors = this.holidayMode 
        ? Math.floor(Math.random() * this.inflowRate * 0.5 + this.inflowRate * 0.75)
        : Math.floor(Math.random() * this.inflowRate * 0.3 + this.inflowRate * 0.85)
      
      const entrance = this.areas.find(a => a.type === 'entrance')
      if (entrance) {
        const canAccept = entrance.maxCapacity - entrance.currentVisitors
        entrance.currentVisitors += Math.min(incomingVisitors, canAccept)
      }

      this.distributeVisitors()
      this.updateHistory()
      this.notifyUpdate()
    }

    const baseInterval = 1000
    this.intervalId = setInterval(tick, baseInterval / this.simulationSpeed)
  }

  distributeVisitors() {
    const maxTransfer = 0.3
    
    this.areas.forEach(area => {
      if (area.type === 'service') return
      
      const transferCount = Math.floor(area.currentVisitors * maxTransfer * Math.random())
      
      if (transferCount <= 0) return
      
      const connectedAreas = this.getConnectedAreas(area.id)
      if (connectedAreas.length === 0) return
      
      const targetScores = connectedAreas.map(target => {
        const congestionRatio = target.currentVisitors / target.maxCapacity
        const availableSpace = target.maxCapacity - target.currentVisitors
        const baseScore = target.popularity * (1 - congestionRatio * 0.8)
        return { area: target, score: baseScore, availableSpace }
      }).filter(t => t.availableSpace > 0)
      
      if (targetScores.length === 0) return
      
      const totalScore = targetScores.reduce((sum, t) => sum + t.score, 0)
      
      let remaining = transferCount
      targetScores.forEach(target => {
        const ratio = target.score / totalScore
        const count = Math.min(
          Math.floor(transferCount * ratio),
          target.availableSpace,
          remaining
        )
        if (count > 0) {
          area.currentVisitors -= count
          target.area.currentVisitors += count
          remaining -= count
        }
      })
    })
  }

  getConnectedAreas(areaId) {
    const connectedIds = areaConnections
      .filter(conn => conn.from === areaId || conn.to === areaId)
      .map(conn => conn.from === areaId ? conn.to : conn.from)
    
    return this.areas.filter(a => connectedIds.includes(a.id))
  }

  updateHistory() {
    const totalVisitors = this.areas.reduce((sum, a) => sum + a.currentVisitors, 0)
    this.visitorHistory.push({
      time: this.timeStep,
      total: totalVisitors,
      areas: this.areas.map(a => ({ id: a.id, visitors: a.currentVisitors }))
    })
    
    if (this.visitorHistory.length > 100) {
      this.visitorHistory.shift()
    }
  }

  notifyUpdate() {
    if (this.onUpdate) {
      this.onUpdate({
        areas: JSON.parse(JSON.stringify(this.areas)),
        history: [...this.visitorHistory],
        timeStep: this.timeStep,
        totalVisitors: this.areas.reduce((sum, a) => sum + a.currentVisitors, 0)
      })
    }
  }

  getAreas() {
    return this.areas
  }

  getHistory() {
    return this.visitorHistory
  }
}

export const findOptimalRoute = (areas, startId, endId, avoidCongested = true) => {
  const areaMap = new Map(areas.map(a => [a.id, a]))
  const congestionThreshold = 0.85
  
  const graph = new Map()
  areas.forEach(area => {
    graph.set(area.id, [])
  })
  
  areaConnections.forEach(conn => {
    const fromArea = areaMap.get(conn.from)
    const toArea = areaMap.get(conn.to)
    
    if (!fromArea || !toArea) return
    
    let weight = conn.distance
    
    if (avoidCongested) {
      const toCongestion = toArea.currentVisitors / toArea.maxCapacity
      if (toCongestion > congestionThreshold) {
        weight *= (1 + (toCongestion - congestionThreshold) * 5)
      }
      
      const fromCongestion = fromArea.currentVisitors / fromArea.maxCapacity
      if (fromCongestion > congestionThreshold) {
        weight *= (1 + (fromCongestion - congestionThreshold) * 3)
      }
    }
    
    graph.get(conn.from).push({ to: conn.to, weight })
    graph.get(conn.to).push({ to: conn.from, weight })
  })
  
  const distances = new Map()
  const previous = new Map()
  const unvisited = new Set(areas.map(a => a.id))
  
  areas.forEach(area => {
    distances.set(area.id, Infinity)
    previous.set(area.id, null)
  })
  distances.set(startId, 0)
  
  while (unvisited.size > 0) {
    let minDist = Infinity
    let current = null
    
    unvisited.forEach(id => {
      const dist = distances.get(id)
      if (dist < minDist) {
        minDist = dist
        current = id
      }
    })
    
    if (current === null || current === endId) break
    
    unvisited.delete(current)
    
    const neighbors = graph.get(current) || []
    neighbors.forEach(({ to, weight }) => {
      if (!unvisited.has(to)) return
      
      const alt = distances.get(current) + weight
      if (alt < distances.get(to)) {
        distances.set(to, alt)
        previous.set(to, current)
      }
    })
  }
  
  const path = []
  let current = endId
  
  while (current !== null) {
    path.unshift(current)
    current = previous.get(current)
  }
  
  if (path[0] !== startId) {
    return { path: [], distance: Infinity, congested: false }
  }
  
  const pathAreas = path.map(id => areaMap.get(id)).filter(Boolean)
  const hasCongested = pathAreas.some(a => a.currentVisitors / a.maxCapacity > congestionThreshold)
  
  return {
    path,
    pathAreas,
    distance: distances.get(endId),
    hasCongested
  }
}

export const generateDiversionRoutes = (areas, congestedAreaId) => {
  const congestedArea = areas.find(a => a.id === congestedAreaId)
  if (!congestedArea) return []
  
  const connected = areaConnections
    .filter(c => c.from === congestedAreaId || c.to === congestedAreaId)
    .map(c => c.from === congestedAreaId ? c.to : c.from)
  
  const diversionRoutes = []
  
  connected.forEach(targetId => {
    const targetArea = areas.find(a => a.id === targetId)
    if (!targetArea) return
    
    const ratio = targetArea.currentVisitors / targetArea.maxCapacity
    if (ratio < 0.6) {
      const route = findOptimalRoute(areas, congestedAreaId, targetId, true)
      if (route.path.length > 0) {
        diversionRoutes.push({
          from: congestedArea,
          to: targetArea,
          route,
          priority: 1 - ratio
        })
      }
    }
  })
  
  return diversionRoutes.sort((a, b) => b.priority - a.priority)
}

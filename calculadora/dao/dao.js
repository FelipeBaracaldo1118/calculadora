// =====================
// 📦 Modelo: User
// =====================
class User {
    constructor(dni, nombre, correo) {
      this.dni = dni
      this.nombre = nombre
      this.correo = correo
      this.lastAccess = new Date().toISOString()
    }
  
    updateAccessTime() {
      this.lastAccess = new Date().toISOString()
    }
  }
  
  // =====================
  // 🗃️ DAO: UserDAO (en memoria)
  // =====================
  class UserDAO {
    constructor() {
      this.users = new Map()
    }
  
    create(user) {
      if (this.users.has(user.dni)) {
        throw new Error(`Usuario con DNI ${user.dni} ya existe`)
      }
      this.users.set(user.dni, user)
    }
  
    getByDni(dni) {
      const user = this.users.get(dni)
      if (!user) return null
      user.updateAccessTime()
      return user
    }
  
    getAll() {
      return Array.from(this.users.values())
    }
  }
  
  // =====================
  // 🔁 Interacción con UI
  // =====================
  const userDao = new UserDAO()
  const form = document.getElementById('user-form')
  const buscarForm = document.getElementById('buscar-form')
  const tableBody = document.querySelector('#user-table tbody')
  
  const renderUsers = () => {
    tableBody.innerHTML = ''
    const users = userDao.getAll()
    users.forEach(user => {
      const row = document.createElement('tr')
      row.innerHTML = `
        <td>${user.dni}</td>
        <td>${user.nombre}</td>
        <td>${user.correo}</td>
        <td>${new Date(user.lastAccess).toLocaleString()}</td>
      `
      tableBody.appendChild(row)
    })
  }
  
  form.addEventListener('submit', e => {
    e.preventDefault()
    const dni = document.getElementById('dni').value.trim()
    const nombre = document.getElementById('nombre').value.trim()
    const correo = document.getElementById('correo').value.trim()
  
    try {
      const user = new User(dni, nombre, correo)
      userDao.create(user)
      renderUsers()
      form.reset()
    } catch (err) {
      alert(err.message)
    }
  })
  
  buscarForm.addEventListener('submit', e => {
    e.preventDefault()
    const dni = document.getElementById('buscar-dni').value.trim()
    const user = userDao.getByDni(dni)
  
    if (user) {
      alert(`Usuario encontrado:\n${user.nombre} (${user.correo})\nÚltimo acceso: ${new Date(user.lastAccess).toLocaleString()}`)
      renderUsers()
    } else {
      alert('Usuario no encontrado')
    }
  })
  
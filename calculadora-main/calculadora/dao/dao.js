
// =====================
// Modelo: Usuario
// =====================
class User {
  constructor(dni, nombre, correo) {
    this.dni = dni
    this.nombre = nombre
    this.correo = correo
    this.createdAt = new Date().toISOString()
    this.lastAccess = new Date().toISOString()
  }

  updateAccessTime(date = null) {
    this.lastAccess = date ? new Date(date).toISOString() : new Date().toISOString()
  }

  isActive() {
    const now = new Date()
    const last = new Date(this.lastAccess)
    return now - last <= 24 * 60 * 60 * 1000
  }

  timeSinceLastAccess() {
    const now = new Date()
    const last = new Date(this.lastAccess)
    const diff = now - last

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return { days, hours, minutes }
  }
}

// =====================
// DAO con localStorage
// =====================
class UserDAO {
  constructor(storageKey = 'usuariosDAO') {
    this.storageKey = storageKey
    this.users = new Map()
    this.load()
  }

  create(user) {
    if (this.users.has(user.dni)) throw new Error('El usuario ya existe')
    this.users.set(user.dni, user)
    this.save()
  }

  getByDni(dni) {
    return this.users.get(dni) || null
  }

  update(dni, data) {
    const user = this.getByDni(dni)
    if (!user) return false
    Object.assign(user, data)
    this.save()
    return true
  }

  delete(dni) {
    const result = this.users.delete(dni)
    if (result) this.save()
    return result
  }

  getAll() {
    return Array.from(this.users.values())
  }

  save() {
    const array = Array.from(this.users.values())
    localStorage.setItem(this.storageKey, JSON.stringify(array))
  }

  load() {
    const raw = localStorage.getItem(this.storageKey)
    if (!raw) return
    const parsed = JSON.parse(raw)
    parsed.forEach(data => {
      const user = new User(data.dni, data.nombre, data.correo)
      user.createdAt = data.createdAt
      user.lastAccess = data.lastAccess
      this.users.set(user.dni, user)
    })
  }
}

// =====================
// UI e interacción
// =====================
const userDao = new UserDAO()

const form = document.getElementById('user-form')
const buscarForm = document.getElementById('buscar-form')
const tableBody = document.querySelector('#user-table tbody')

// =====================
// Modal de edición
// =====================
const editModal = document.getElementById('edit-modal')
const editForm = document.getElementById('edit-form')
const inputDni = document.getElementById('edit-dni')
const inputNombre = document.getElementById('edit-nombre')
const inputCorreo = document.getElementById('edit-correo')
const cancelarBtn = document.getElementById('cancelar-edicion')

const abrirModalEdicion = user => {
  inputDni.value = user.dni
  inputNombre.value = user.nombre
  inputCorreo.value = user.correo
  editModal.classList.remove('hidden')
}

const cerrarModalEdicion = () => {
  editModal.classList.add('hidden')
}

editForm.addEventListener('submit', e => {
  e.preventDefault()
  const dni = inputDni.value
  const user = userDao.getByDni(dni)
  if (user) {
    user.nombre = inputNombre.value
    user.correo = inputCorreo.value
    userDao.update(dni, user)
    cerrarModalEdicion()
    renderUsers()
  }
})

cancelarBtn.addEventListener('click', cerrarModalEdicion)

// =====================
// Render de la tabla
// =====================
const renderUsers = () => {
  tableBody.innerHTML = ''
  const users = userDao.getAll()

  users.forEach(user => {
    const active = user.isActive()
    const lastAccess = new Date(user.lastAccess).toLocaleString()
    const { days, hours, minutes } = user.timeSinceLastAccess()
    const tooltip = active
      ? 'Activo'
      : `Último acceso: hace ${days}d ${hours}h ${minutes}m`

    const row = document.createElement('tr')
    row.innerHTML = `
      <td>${user.dni}</td>
      <td>${user.nombre}</td>
      <td>${user.correo}</td>
      <td>${lastAccess}</td>
      <td>
        <button 
          data-action="edit" 
          data-dni="${user.dni}" 
          ${!active ? 'disabled' : ''} 
          title="${tooltip}">
          Modificar
        </button>
        <button 
          data-action="delete" 
          data-dni="${user.dni}" 
          ${!active ? 'disabled' : ''} 
          title="${tooltip}">
          Eliminar
        </button>
        <button 
          data-action="debug-date" 
          data-dni="${user.dni}" 
          title="Modificar fecha de acceso">
          Fecha
        </button>
      </td>
    `
    tableBody.appendChild(row)
  })

  // Eventos botones
  tableBody.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const user = userDao.getByDni(btn.dataset.dni)
      if (user && user.isActive()) abrirModalEdicion(user)
    })
  })

  tableBody.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const user = userDao.getByDni(btn.dataset.dni)
      if (user && user.isActive() && confirm(`¿Eliminar a ${user.nombre}?`)) {
        userDao.delete(user.dni)
        renderUsers()
      }
    })
  })

  tableBody.querySelectorAll('[data-action="debug-date"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const user = userDao.getByDni(btn.dataset.dni)
      if (user) {
        const nuevaFecha = prompt('Nueva fecha (YYYY-MM-DD HH:MM):', user.lastAccess.slice(0, 16).replace('T', ' '))
        if (nuevaFecha) {
          user.updateAccessTime(new Date(nuevaFecha))
          userDao.update(user.dni, user)
          renderUsers()
        }
      }
    })
  })
}

// =====================
// Formularios
// =====================
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
  if (!user) {
    alert('Usuario no encontrado')
    return
  }
  user.updateAccessTime()
  userDao.update(user.dni, user)
  alert(`Último acceso actualizado: ${new Date(user.lastAccess).toLocaleString()}`)
  renderUsers()
})

// Carga inicial
renderUsers()

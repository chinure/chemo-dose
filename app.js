(function () {
  const state = {
    activeTab: 'bsa',
    sex: 'male',
    toastTimer: null
  }

  function $(selector) {
    return document.querySelector(selector)
  }

  function $all(selector) {
    return Array.from(document.querySelectorAll(selector))
  }

  function toNumber(value) {
    const number = Number(value)
    return Number.isFinite(number) ? number : NaN
  }

  function round(value, digits) {
    const factor = Math.pow(10, digits)
    return String(Math.round(value * factor) / factor)
  }

  function requirePositive(values) {
    return values.every((value) => {
      const number = toNumber(value)
      return Number.isFinite(number) && number > 0
    })
  }

  function setText(id, value) {
    const element = document.getElementById(id)
    if (element) {
      element.textContent = value
    }
  }

  function showToast(message) {
    const toast = $('#toast')
    if (!toast) return

    window.clearTimeout(state.toastTimer)
    toast.textContent = message
    toast.classList.add('show')
    state.toastTimer = window.setTimeout(() => {
      toast.classList.remove('show')
    }, 1800)
  }

  function switchTab(tab) {
    state.activeTab = tab

    $all('.tab').forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === tab)
    })

    $all('[data-panel]').forEach((panel) => {
      panel.classList.toggle('hidden', panel.dataset.panel !== tab)
    })
  }

  function setSex(sex) {
    state.sex = sex

    $all('.sex').forEach((button) => {
      const active = button.dataset.sex === sex
      button.classList.toggle('active', active)
      button.setAttribute('aria-pressed', String(active))
    })
  }

  function calculateBsa() {
    const weight = $('#bsa-weight').value
    const height = $('#bsa-height').value
    const dosePerM2 = $('#bsa-dose').value

    if (!requirePositive([weight, height, dosePerM2])) {
      showToast('请输入大于 0 的数值')
      return
    }

    const area = Math.pow(toNumber(weight), 0.425) * Math.pow(toNumber(height), 0.725) * 71.84 / 10000
    const totalDose = area * toNumber(dosePerM2)

    setText('bsa-area', round(area, 3))
    setText('bsa-total', round(totalDose, 1))
    setText('bsa-dose-preview', dosePerM2)
  }

  function resetBsa() {
    $('#bsa-weight').value = ''
    $('#bsa-height').value = ''
    $('#bsa-dose').value = ''
    setText('bsa-area', '--')
    setText('bsa-total', '--')
    setText('bsa-dose-preview', '--')
  }

  function calculateCalvert() {
    const age = $('#calvert-age').value
    const weight = $('#calvert-weight').value
    const scr = $('#calvert-scr').value
    const auc = $('#calvert-auc').value

    if (!requirePositive([age, weight, scr, auc])) {
      showToast('请输入大于 0 的数值')
      return
    }

    const maleCrcl = (140 - toNumber(age)) * toNumber(weight) * 1.23 / toNumber(scr)
    const crcl = state.sex === 'female' ? maleCrcl * 0.85 : maleCrcl
    const totalDose = toNumber(auc) * (crcl + 25)

    setText('calvert-crcl', round(crcl, 1))
    setText('calvert-total', round(totalDose, 1))
    setText('calvert-auc-preview', auc)
  }

  function fillCalvertExample() {
    setSex('male')
    $('#calvert-age').value = '60'
    $('#calvert-weight').value = '60'
    $('#calvert-scr').value = '80'
    $('#calvert-auc').value = '5'
    setText('calvert-crcl', '--')
    setText('calvert-total', '--')
    setText('calvert-auc-preview', '--')
  }

  function resetCalvert() {
    setSex('male')
    $('#calvert-age').value = ''
    $('#calvert-weight').value = ''
    $('#calvert-scr').value = ''
    $('#calvert-auc').value = ''
    setText('calvert-crcl', '--')
    setText('calvert-total', '--')
    setText('calvert-auc-preview', '--')
  }

  function bindEvents() {
    $all('.tab').forEach((button) => {
      button.addEventListener('click', () => switchTab(button.dataset.tab))
    })

    $all('.sex').forEach((button) => {
      button.addEventListener('click', () => setSex(button.dataset.sex))
    })

    $('#bsa-calc').addEventListener('click', calculateBsa)
    $('#bsa-reset').addEventListener('click', resetBsa)
    $('#calvert-calc').addEventListener('click', calculateCalvert)
    $('#calvert-example').addEventListener('click', fillCalvertExample)
    $('#calvert-reset').addEventListener('click', resetCalvert)

    $('#bsa-dose').addEventListener('input', (event) => {
      setText('bsa-dose-preview', event.target.value || '--')
    })

    $('#calvert-auc').addEventListener('input', (event) => {
      setText('calvert-auc-preview', event.target.value || '--')
    })
  }

  document.addEventListener('DOMContentLoaded', bindEvents)
})()

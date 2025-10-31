// initialization
const sideBarContent = document.querySelector("#sidebar-content")
const content = document.querySelector("#content")

const searchBGContainer = document.querySelector("#search-bg-container")
const searchContainer = document.querySelector("#search-container")
const searchInput = document.querySelector("#search-input")
const searchDropDown = document.querySelector("#search-dropdown")

const md = window.markdownit({
    breaks: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return `<pre><code class="hljs language-${lang}">` +
                   hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                   '</code></pre>';
          } catch (__) {}
        }
    
        return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
    }
})
md.use(centerImagesPlugin)
md.use(externalLinksPlugin)

let dataCache = {en: {}, pl: {}}
let currentLanguage = localStorage.getItem('language') || 'en' // Default to English, or get from localStorage
let fullDataCache = {} // Store full data structure

// Make currentLanguage accessible globally for onclick handlers
window.currentLanguage = currentLanguage

/**
 * Fetches the json db
 * @returns JS object
 */
async function fetchDB(){

    try{
        const response = await fetch(`data.json`)
        return await response.json()
    }catch(e){
        return 
    }
}

/**
 * Switch language and reload content
 */
function switchLanguage(lang) {
    console.log('=== switchLanguage called with ===', lang)
    console.log('fullDataCache keys:', Object.keys(fullDataCache))
    console.log('fullDataCache[lang] exists:', !!fullDataCache[lang])
    
    if (!fullDataCache || !fullDataCache[lang]) {
        console.error('ERROR: Cannot switch - data not loaded for language:', lang)
        alert('Language data not loaded yet. Please refresh the page.')
        return
    }
    
    currentLanguage = lang
    window.currentLanguage = lang // Update global reference
    localStorage.setItem('language', lang) // Save preference
    
    console.log('About to call loadLanguageData...')
    loadLanguageData()
    console.log('loadLanguageData called')
}

// Make switchLanguage accessible globally
window.switchLanguage = switchLanguage

// Simple toggle function for inline onclick
function toggleLanguage() {
    console.log('toggleLanguage called!')
    console.log('currentLanguage before:', currentLanguage)
    const newLang = currentLanguage === 'en' ? 'pl' : 'en'
    console.log('switching to:', newLang)
    switchLanguage(newLang)
}

// Make it globally accessible
window.toggleLanguage = toggleLanguage

/**
 * Load data for current language and rebuild UI
 */
function loadLanguageData() {
    console.log('loadLanguageData called, currentLanguage:', currentLanguage)
    console.log('fullDataCache keys:', Object.keys(fullDataCache))
    window.currentLanguage = currentLanguage // Keep global reference in sync
    if (!fullDataCache[currentLanguage]) {
        console.error('No data found for language:', currentLanguage, 'Available:', Object.keys(fullDataCache))
        return
    }
    
    const langData = fullDataCache[currentLanguage]
    dataCache = langData
    
    // Update portfolio name in header
    const portfolioName = document.getElementById('portfolio-name')
    if (portfolioName && langData.name) {
        portfolioName.textContent = langData.name
    }
    
    // Update language toggle button
    updateLanguageToggle()
    
    // Update search and home buttons
    updateSidebarButtons()
    
    // Rebuild sidebar
    sideBarContent.innerHTML = ""
    for (let x of langData.pages){
        buildSideBar(x.icon, x.name, x.link, x.content)
    }
    
    // Update search
    loadSearchResults(langData.pages)
    
    // Reload current page or default to about
    const currentPageLink = window.currentPageLink || '/about'
    loadPage(currentPageLink)
}

/**
 * Update language toggle button appearance
 */
function updateLanguageToggle() {
    const langText = document.getElementById('language-text')
    const langEn = document.getElementById('lang-en')
    const langPl = document.getElementById('lang-pl')
    
// Update button text depending on current language
if (langText) {
    langText.textContent = currentLanguage === 'en' ? 'Change' : 'Zmień'
}

    
    // Highlight current language
    if (langEn && langPl) {
        if (currentLanguage === 'en') {
            langEn.className = 'tw-px-2 tw-py-1 tw-rounded tw-bg-blue-500 tw-text-white'
            langPl.className = 'tw-px-2 tw-py-1 tw-rounded tw-text-gray-500'
        } else {
            langEn.className = 'tw-px-2 tw-py-1 tw-rounded tw-text-gray-500'
            langPl.className = 'tw-px-2 tw-py-1 tw-rounded tw-bg-blue-500 tw-text-white'
        }
    }
}

/**
 * Update sidebar button texts (Search, Home)
 */
function updateSidebarButtons() {
    const searchButton = document.querySelector('button[onclick="openSearch()"]')
    const homeButton = document.querySelector('button[onclick="loadPage(\'/about\')"]')
    
    const translations = {
        en: { search: 'Search', home: 'Home' },
        pl: { search: 'Szukaj', home: 'Strona główna' }
    }
    
    const t = translations[currentLanguage] || translations.en
    
    if (searchButton) {
        const searchText = searchButton.querySelector('div')
        if (searchText) searchText.textContent = t.search
    }
    
    if (homeButton) {
        const homeText = homeButton.querySelector('div')
        if (homeText) homeText.textContent = t.home
    }
}

async function fetchContent(path){
    
    try{
        const response = await fetch(path)
        return await response.text()

    }catch(e){
        console.error(e)
        return ""
    }
}


// Initialize app
fetchDB().then((data) => {
    console.log('=== Data loaded ===')
    console.log('Data keys:', Object.keys(data))
    console.log('Data structure:', data)
    fullDataCache = data
    
    if (!data || Object.keys(data).length === 0) {
        console.error('ERROR: Data is empty!')
        return
    }
    
    console.log('About to load language data...')
    loadLanguageData()
    console.log('Language data loaded')
    
    // Initialize switch state
    updateLanguageToggle()
})


function buildSideBar(icon, name, link, content){

    let iconElement = ""
    
    if (isFileOrLink(icon)){
        iconElement = `<div class="icon"><img src=${icon} class="tw-object-contain" ></div>`
    }else if (isEmoji(icon)){
        iconElement = `<p class="">${icon}</p>` // bootstrap icon class

    }else{     
        iconElement = `<i class="${icon ?? "bi bi-file-earmark"}"></i>` // bootstrap icon class
    }


    sideBarContent.innerHTML += `
        <button onclick="updateContent('${content}', '${icon}', '${name}', '${link}')" id="${link}" class="page-link tw-text-base tw-flex tw-flex-gap-1">
            ${iconElement}
            <div class="">${name}</div>
        </button>
    `
}

async function updateContent(path, icon, title, link){
    // Close mobile menu if open (on mobile devices)
    if (window.innerWidth < 768) {
        toggleMobileMenu()
    }

    const body = await fetchContent(path)

    let iconElement = ""
    
    if (isFileOrLink(icon)){
        iconElement = `<img src=${icon} class="tw-object-cover tw-w-full tw-h-full" >`
    }else if (isEmoji(icon)){
        iconElement = `<p class="">${icon}</p>` // bootstrap icon class

    }else{     
        iconElement = `<i class="${icon ?? "bi bi-file-earmark"}"></i>` // bootstrap icon class
    }

    document.querySelector("#content-icon").innerHTML = iconElement
    document.querySelector("#title").innerHTML = `
                                <div class='tw-flex tw-gap-1'>
                                    <div class="tw-w-[20px] tw-h-[20px] tw-text-sm tw-rounded-sm tw-overflow-hidden">${iconElement}</div> 
                                    ${title}
                                </div>
                                `

    content.innerHTML = `

        ${path.endsWith(".md") ? md.render(body) : body}   
    `

    document.querySelectorAll(".page-link").forEach((ele) => {
        ele.classList.remove("active")
    })

    document.getElementById(link).classList.add("active")
}

function loadPage(pageLink){
    window.currentPageLink = pageLink // Store current page for language switch
    
    // Close mobile menu if open (on mobile devices)
    if (window.innerWidth < 768) {
        toggleMobileMenu()
    }
    
    const item = dataCache.pages?.find(obj => obj.link === pageLink)

    if (!item){
        console.warn([`Page not found for: ${pageLink}`])
        return
    }

    updateContent(item.content, item.icon, item.name, item.link)
}

function searchOnClick(link){
    loadPage(link)
    setTimeout(closeSearch, 100)
}

function updateSearch(event){

    let searchResults = []

    dataCache.pages?.forEach(item => {
        if (item.name.toLowerCase().startsWith(event.target.value.toLowerCase())){
            searchResults.push(item)
        }
    })

    loadSearchResults(searchResults)

}

function loadSearchResults(data){

    if (data.length === 0){
        return 
    }
    searchDropDown.innerHTML = ""

    data.forEach((item) => {

        let icon = item.icon
        let iconElement = ""
        if (isFileOrLink(icon)){
            iconElement = `<img src=${icon} class="tw-object-cover tw-w-full tw-h-full" >`
        }else if (isEmoji(icon)){
            iconElement = `<p class="">${icon}</p>` // bootstrap icon class
    
        }else{     
            iconElement = `<i class="${icon ?? "bi bi-file-earmark"} "></i>` // bootstrap icon class
        }

        searchDropDown.innerHTML += `
                <button onclick="searchOnClick('${item.link}')" class="tw-flex tw-text-base tw-place-items-center tw-gap-2 tw-rounded-sm tw-cursor-pointer tw-p-2 tw-px-3 tw-w-full hover:tw-bg-[#f1f0ef]">
                    <div class="tw-w-[20px] tw-text-sm tw-h-[20px] tw-overflow-hidden tw-rounded-sm">
                        ${iconElement} 
                    </div>
                    ${item.name}
                </button>
            `
    })

}

function searchClickOutside(event){

    if (!searchContainer.contains(event.target)){
        closeSearch()
    }


}

function openSearch(){
    // Close mobile menu if open (on mobile devices)
    if (window.innerWidth < 768) {
        toggleMobileMenu()
    }

    searchBGContainer.classList.remove("tw-hidden")
    setTimeout(() => {
        searchInput.focus()
    }, 1)

    setTimeout(() => window.document.addEventListener("click", searchClickOutside), 100)

}


function closeSearch(){

    searchBGContainer.classList.add("tw-hidden")
    window.document.removeEventListener("click", searchClickOutside)

}

window.addEventListener("keydown", (event) => {
    console.log("press")
    if (event.key === 'Escape'){
        closeSearch()
    }

})

// Mobile menu toggle function
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar')
    const overlay = document.getElementById('mobile-sidebar-overlay')
    
    if (sidebar && overlay) {
        // Toggle the open state
        const isOpen = sidebar.classList.contains('mobile-menu-open')
        
        if (isOpen) {
            // Close sidebar
            sidebar.classList.remove('mobile-menu-open')
            overlay.classList.add('tw-hidden')
        } else {
            // Open sidebar
            sidebar.classList.add('mobile-menu-open')
            overlay.classList.remove('tw-hidden')
        }
    }
}

// Make it globally accessible
window.toggleMobileMenu = toggleMobileMenu


const covid19 = (function(){

    //variables
    const storage_token = 'jwt-token'
    const form_id = '#js-form'
    const grafico = '#grafico'
    const url_base = 'http://localhost:3000/api/'
    let countries = []
    let confirmedCase = []
    let deaths = []


    //estado
    const state = {}

    //DOMCache
    const form = document.querySelector(form_id)
    const nav = document.querySelector('#navbarNav')
    const ctx = document.getElementById('myChart').getContext('2d');
    const ctxx = document.getElementById('myChart')
    const titulo_grafico = document.querySelector('.titulo_grafico')
    const info2 = document.querySelector('.info2')
    const login = document.querySelector('.login')
    let tabla = document.querySelector('.tabla')
    let modalDetalleBody = document.querySelector('.modalDetalleBody')

    //eventHandling
    form.addEventListener('submit', submitHandler)
    nav.addEventListener('click', logoutHandler)
    login.addEventListener('click', iniciarSesion)

    // functiones
    async function init() {
        const token = localStorage.getItem(storage_token)

        if (token) {
            state.token = token
            displayPost()
            addLogOut()
        }
    }

    function iniciarSesion(){
        $('.modalLogin').modal()
    }

    async function submitHandler(e){
        e.preventDefault()

        const form_data = {
            email: form.email.value,
            password: form.password.value
        }

        await getJWT(form_data)
        displayPost()
    }

    async function getJWT(data){
        try {
            const response = await fetch(url_base + 'login/', {
                method: 'POST',
                body: JSON.stringify(data)
            })

            const { token } = await response.json()
            state.token = token
            localStorage.setItem(storage_token, token)

            $('.modalLogin').modal('hide')

            return token
            
        } catch (error) {
            console.error(error)
        }
    }

    async function getTotal(){
        try {
            let response = await fetch(url_base + `total`, {
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Bearer ${state.token}`
                }
            })

            const { data: covid } = await response.json()
            return covid
            
        } catch (error) {
            console.error(error)
        }
    }
    
    async function Grafico(covid){

        titulo_grafico.innerHTML = `<h2>Pa??ses con Covid-19</h2><p>Haz click en las barras para m??s detalles</p><hr>`
        
        //se llenan los arreglos con la informaci??n del gr??fico
        // covid.filter(country => country.confirmed > 8000000)
        covid.forEach(i => {
            if (i.confirmed > 8000000) {
                confirmedCase.push(i.confirmed)
                countries.push(i.location)
                deaths.push(i.deaths)
            }
        });

        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: countries,
                datasets: [{
                    label: 'm??s de 8 millones de casos confirmados',
                    data: confirmedCase,
                    backgroundColor: ['rgb(255, 206, 86, 0.7)'],
                    borderColor: ['rgba(255, 206, 86, 1)'],
                    borderWidth: 2
                },
                {
                    label: 'muertes',
                    data: deaths,
                    backgroundColor: ['rgb(255, 26, 104, 0.7)'],
                    borderColor: ['rgba(255, 26, 104, 1)'],
                    borderWidth: 2
                }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(){
                                return 'Click para mas detalle'
                            }
                        }
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        //Ventana modal con los detalles de cada pa??s
        async function detalles(click1){

            //seleccionar las barras
            const point = myChart.getElementsAtEventForMode(click1, 'nearest', {intersect: 'true'}, true)
            
            if (point[0]) {

                //sacar indice de cada barra
                const index = point[0].index

                let response = await fetch(url_base + `countries/${countries[index]}`, {
                    headers: {
                        'Content-type': 'application/json',
                        Authorization: `Bearer ${state.token}`
                    }
                })
    
                const {data: country} = await response.json()

                info2.innerHTML = `<p><b>Pa??s:</b> ${country.location}</p> 
                <p><b>Casos confirmados:</b> ${country.confirmed}</p><p><b>Muertes:</b> ${country.deaths}</p>`
                $('.infoCovid').modal()
            }
        }

        ctxx.onclick = detalles

    }

    async function table(covid){

        //genera la tabla con todos los pa??ses
        const col = covid.map(function(i){
            return `<tr>
                        <td>${i.location}</td>
                        <td>${i.confirmed}</td>
                        <td>${i.deaths}</td>
                        <td><button class="btn btn-primary verDetalle" id="${i.location}">ver detalles</button></td>
                    </tr>`
        }).join('')
        
        //imprime la tabla en el html
        tabla.innerHTML = `
        <table class="table">
        <thead>
            <tr>
                <th scope="col">Pa??s</th>
                <th scope="col">Confirmados</th>
                <th scope="col">Muertes</th>
                <th scope="col">Detalles</th>
            </tr>
        </thead>
        <tbody>${col}</tbody>
        </table>`

        //obtener id del bot??n donde se hizo click
        document.querySelectorAll('.verDetalle').forEach(btn => {
            btn.addEventListener('click', e => {
                var id = e.target.getAttribute('id');

                //consulta y gr??fica
                async function detalleModal(){
                    let response = await fetch(url_base + `countries/${id}`, {
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${state.token}`
                        }
                    })

                    //data del pa??s consultado
                    const {data: c} = await response.json();
                    // const { location: [pais], confirmed: [confirmados], deaths: [muertes] } = country
                    const pais = [c.location]
                    const confirmados = [c.confirmed]
                    const muertes = [c.deaths]

                    //-----------------------------------------------------------------------

                    //gr??fico del modal
                    const data = {
                        labels: pais,
                        datasets: [{
                            label: 'confirmados',
                            data: confirmados,
                            backgroundColor: ['rgb(255, 206, 86, 0.7)'],
                            borderColor: ['rgba(255, 206, 86, 1)'],
                            borderWidth: 2
                        },
                        {
                            label: 'muertes',
                            data: muertes,
                            backgroundColor: ['rgb(255, 26, 104, 0.7)'],
                            borderColor: ['rgba(255, 26, 104, 1)'],
                            borderWidth: 2
                        }]
                    }

                    const config = {
                        type: 'bar',
                        data,
                        options: {
                            scales: {
                                y: { beginAtZero: true }
                            }
                        }
                    }

                    //inicializaci??n del gr??fico
                    modalDetalleBody.innerHTML = `<canvas id="myChart2"></canvas>`

                    let myChart2 = new Chart(
                        document.getElementById('myChart2'),
                        config
                    )
                    
                    //levanta la ventana modal con el gr??fico
                    $('.modalDetalle').modal()
                }

                //destrucci??n de gr??fico
                modalDetalleBody.innerHTML = ''
                detalleModal()

            });
        })
    }

    function toggleForm(form_id, grafico){
        document.querySelector(form_id).classList.toggle('d-none')
        document.querySelector(grafico).classList.toggle('d-block')
    }

    async function displayPost(){
        const posts = await getTotal()
        addLogOut()
        Grafico(posts)
        table(posts)
        toggleForm(form_id, grafico)
    }

    function logoutHandler(e){
        if (e.target.classList.contains('logout')) {
            e.preventDefault()
            localStorage.removeItem(storage_token)
            location.reload()
        }
    }

    function addLogOut(){
        nav.innerHTML = `<ul class="navbar-nav ml-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="#">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="./situacionChile.html">Situaci??n Chile</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link logout" href="#">Cerrar sesi??n</a>
                            </li>
                        </ul>`
    }

    //return
    return {init}

})()

covid19.init()

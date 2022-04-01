const chile = (function(){

    //variables
    const url_base = 'http://localhost:3000/api/'
    let confirmados = []
    let muertes = []
    let recuperados = []
    let fechas = []

    //token
    const token = localStorage.getItem('jwt-token')

    //DOMCache
    let titulo = document.querySelector('.titulo')
    let carga = document.querySelector('.carga')
    const nav = document.querySelector('#mainNav ul')

    //funciones

    function init(){   
        navbar()
        graficoChile()
    }

    function navbar(){
        nav.innerHTML = `<ul class="navbar-nav ml-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="./index.html">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#">Situación Chile</a>
                            </li>
                        </ul>`
    }

    //obtener datos confirmados
    async function getConfirmed(){
        try {
            let response = await fetch(url_base + `confirmed`, {
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })

            const {data: confirmed} = await response.json()
            return confirmed
            
        } catch (error) {
            console.error(error)
        }
    }

    //obtener datos de muertes
    async function getDeaths(){
        try {
            let response = await fetch(url_base + `deaths`, {
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })

            const {data: deaths} = await response.json()
            return deaths
            
        } catch (error) {
            console.error(error)
        }
    }

    //obtener datos de recuperados
    async function getRecovered(){
        try {
            let response = await fetch(url_base + `recovered`, {
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })

            const {data: recovered} = await response.json()
            return recovered
            
        } catch (error) {
            console.error(error)
        }
    }

    //gráfico lineal
    async function graficoChile(){

        carga.innerHTML = `<img src="./assets/img/covid19.gif" alt="cargando..." width="100" class="my-5 py-5">`

        const conf = await getConfirmed()
        const dea = await getDeaths()
        const recov = await getRecovered()

        carga.innerHTML = ''

        titulo.innerText = `Situación en Chile`

        //se llenan todos los arreglos con la información
        conf.forEach(i => {
            if (i.total > 0) {
                fechas.push(i.date)
                confirmados.push(i.total)
            }
        });

        dea.forEach(i => {
            if (i.total > 0) {
                muertes.push(i.total)
            }
        });

        // recuperados = recov.filter(country => country.total > 0).map(country => country.total)
        recov.forEach(i => {
            if (i.total > 0) {
                recuperados.push(i.total)
            }
        });

        //gráfico
        const labels = fechas;

        const data = {
            labels: labels,
            datasets: [{
                label: 'Confirmados',
                backgroundColor: 'rgb(255, 206, 86)',
                borderColor: 'rgb(255, 206, 86)',
                data: confirmados,
            },
            {
                label: 'Muertes',
                backgroundColor: 'rgb(201, 203, 207)',
                borderColor: 'rgb(201, 203, 207)',
                data: muertes,
            },
            {
                label: 'Recuperados',
                backgroundColor: 'rgb(54, 162, 235)',
                borderColor: 'rgb(54, 162, 235)',
                data: recuperados,
            }]
        };

        const config = {
            type: 'line',
            data: data,
            options: {}
        };

        const myChart = new Chart(
            document.getElementById('myChart'),
            config
        );
    }

    return {init}

})()

chile.init()

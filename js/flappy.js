function novoElemento(tagName, className){
    const elem = document.createElement(tagName);
    elem.className = className;
    return elem;
}
function Barreira(reversa = false){
    this.elemento = novoElemento('div', 'barreira');

    const borda = novoElemento('div', 'borda');
    const corpo = novoElemento('div', 'corpo');

    this.elemento.appendChild(reversa ? corpo : borda);
    this.elemento.appendChild(reversa ? borda : corpo);

    this.setAltura = altura => corpo.style.height = `${altura}px`;

}

function ParDeBarreiras(altura, abertura, x){
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])

    this.setX = x => this.elemento.style.left = `${x}px`

    this.getLargura = () => this.elemento.clientWidth
    this.sortearAbertura()
    this.setX(x)
}
// const b = new ParDeBarreiras(700, 200, 800)
// document.querySelector('[tp-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificaPonto){
    this.pares =[
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco *2),
        new ParDeBarreiras(altura, abertura, largura + espaco *3)

    ];
    const deslocamento = 3;

    this.animar = () =>{
        this.pares.forEach( par => {
            par.setX(par.getX() - deslocamento);
            //quando o elemento sair da area do jogo:
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura();
            }
            const meio = largura / 2;
            const cruzouOMeio = 
            par.getX() + deslocamento >= meio && 
            par.getX() < meio;
            if(cruzouOMeio) notificaPonto();
        })
    }
}

function Passaro(alturaJogo){
    let voando = false

    //criando o elemento: <img class="passaro" src="imagens/passaro.png"/>:
    this.elemento = novoElemento('img','passaro')
    this.elemento.src = 'imagens/passaro.png'

    this.getX = () => parseInt(this.elemento.style.bottom.split('px')[0]) //captura a posiçao do passaro
    this.setY = y => this.elemento.style.bottom = `${y}px` //setamos a posiçao para ele fazer a animaçao em cima da altura

    window.onkeydown = e => voando = true //quando pressiona a tecla, iremos trocar a variavel voando para true
    window.onkeyup = e => voando = false // quando solta a tecla, iremos trocar a variavel voando para false

    this.animar = () =>{
        const novoY = this.getX() + (voando ? 8 : -5) // irá depender se ele estiver voando. Se estiver voando, subirá 8, se estiver caindo, cairá 5
        const alturaMaxima = alturaJogo - this.elemento.clientHeight //essa é a altura do proprio elemento. a altura do proprio passaro <img>

        if (novoY <= 0){ //se o novoY, que ainda nao setamos, for menor que zero, o passaro estará descendo
            this.setY(0) //setamos para zero, para que o passaro nao saia do campo de visao do jogo
        } else if(novoY >= alturaMaxima){ //se o Y for maior do que a altura maximado jogo permitida
            this.setY(alturaMaxima) //setamos a altura maxima
        }else {
            this.setY(novoY)// e se ele nao viola nenhuma das condiçoes, setamos o novoY
        }
    }
 this.setY(alturaJogo / 2) //que é 700 px, divide por 2 = 350px
}

function Progresso (){
    this.elemento = novoElemento('span', 'progresso') //criando o elemento <span class="progresso"></span>
    
    this.atualizarPontos = pontos => { //funcao onde recebemos os pontos e fazemos a atribuicao desses pontos dentro do nosso elemento
        this.elemento.innerHTML = pontos //<span class="progresso">
    }
    this.atualizarPontos(0)
}

function estaoSobrePostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras){
    let colidiu = false

    barreiras.pares.forEach( ParDeBarreiras => {
        if(!colidiu) {
        const superior = ParDeBarreiras.superior.elemento
        const inferior = ParDeBarreiras.inferior.elemento

        colidiu = estaoSobrePostos(passaro.elemento, superior) || estaoSobrePostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyBird(){
    let pontos = 0 //controla a pontuaçao do jogo

    const areaDoJogo = document.querySelector('[tp-flappy]') //captura a area do html onde temos o atriburo [tp-flappy] e atribuindo a variavel areaDoJogo
    const altura = areaDoJogo.clientHeight //captura a altura do jogo
    const largura = areaDoJogo.clientWidth //captura a largura do jogo

    const progresso = new Progresso() //cria o elemento progresso
    const barreiras = new Barreiras(altura, largura, 300, 400, //cria os elementos barreiras() passando os parametros: altura, largura, abertura entre as barreiras: 200px, espaço entre as barreiras: 400px
        () => progresso.atualizarPontos(++pontos))

    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)

    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {

        const temporizador = setInterval( () =>{
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)){
                clearInterval(temporizador) 
            }
        }, 20 )
    }
}

new FlappyBird().start()

//  const barreiras = new Barreiras (700, 1200, 200, 400);
//  const passaro = new Passaro(700)
//  const areaDoJogo = document.querySelector('[tp-flappy]');

//  areaDoJogo.appendChild(new Progresso().elemento)
//  areaDoJogo.appendChild(passaro.elemento)
//  barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento));

//  setInterval( () =>{
//      barreiras.animar()
//      passaro.animar()
//  }, 10);





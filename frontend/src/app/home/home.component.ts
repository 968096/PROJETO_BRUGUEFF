import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, Renderer2, Inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

interface SiteColor {
  id: string;
  label: string;
  value: string;
  cssVar: string;
}

export interface SiteConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts: {
    family: string;
  };
  layout: {
    titleSize: number;
    textSize: number;
    spacing: number;
    borderRadius: number;
    showCircleBg: boolean;
  };
  animations: {
    speed: string;
  };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('bgCircular') bgCircular!: ElementRef;
  @ViewChild('aboutImg') aboutImg!: ElementRef;
  
  // Admin Dashboard
  isAdminMode = true; // Defina como false para produção
  isAdminDashboardOpen = false;
  activeAdminTab: string = 'colors';
  adminTabs = [
    { id: 'colors', name: 'Cores' },
    { id: 'fonts', name: 'Tipografia' },
    { id: 'layout', name: 'Layout' },
    { id: 'animations', name: 'Animações' }
  ];
  
  // Configurações do site
  siteColors: SiteColor[] = [
    { id: 'background', label: 'Fundo Principal', value: '#dfe4d1', cssVar: '--mint-green' },
    { id: 'text', label: 'Texto Principal', value: '#333333', cssVar: '--dark-text' },
    { id: 'accent', label: 'Cor de Destaque', value: '#ff4081', cssVar: '--accent-color' },
    { id: 'sectionLight', label: 'Seção Clara', value: '#ffffff', cssVar: '--section-bg-light' },
    { id: 'sectionDark', label: 'Seção Escura', value: '#dfe4d1', cssVar: '--section-bg-dark' }
  ];
  
  // Lista de fontes disponíveis
  availableFonts = [
    'Montserrat',
    'Roboto',
    'Open Sans',
    'Lato',
    'Playfair Display',
    'Poppins',
    'Raleway'
  ];
  
  // Cópia de backup das configurações originais
  originalColors: SiteColor[] = [];
  
  // Configurações do site
  siteConfig: SiteConfig = {
    colors: {
      primary: '#dfe4d1',
      secondary: '#ff4081',
      accent: '#ff4081',
      text: '#333333',
      background: '#dfe4d1'
    },
    fonts: {
      family: 'Montserrat'
    },
    layout: {
      titleSize: 36,
      textSize: 16,
      spacing: 20,
      borderRadius: 0,
      showCircleBg: true
    },
    animations: {
      speed: 'normal'
    }
  };
  
  // Cópia de backup das configurações originais
  originalConfig: SiteConfig = { ...this.siteConfig };
  
  /**
   * Array de seções do portfólio com seus respectivos dados
   */
  portfolioItems: PortfolioItem[] = [
    {
      id: 1,
      title: 'Design Gráfico',
      description: 'Identidade Visual',
      imageUrl: 'assets/images/site_Prancheta 1 cópia 2.png'
    },
    {
      id: 2,
      title: 'Branding',
      description: 'Logo e Manual',
      imageUrl: 'assets/images/site_Prancheta 1 cópia 3.png'
    },
    {
      id: 3,
      title: 'Web Design',
      description: 'UI/UX',
      imageUrl: 'assets/images/site_Prancheta 1 cópia 5.png'
    }
  ];

  /**
   * Dados do designer/artista
   */
  designerInfo: DesignerInfo = {
    name: 'FEFE',
    bio: 'Designer apaixonada por criar experiências visuais únicas. Dedico-me a transformar conceitos em projetos impactantes que comunicam de forma efetiva e memorável. Minha abordagem combina técnicas tradicionais com as mais recentes tendências digitais, sempre buscando soluções inovadoras para cada desafio criativo.',
    imageUrl: 'assets/images/jack.jpg'
  };

  /**
   * Formulário de contato
   */
  contactForm: ContactForm = {
    name: '',
    email: '',
    message: ''
  };

  /**
   * Listeners de scroll para atualizar animações quando necessário
   */
  private scrollListener: any;

  // Adicionar propriedades para notificações
  notificationMessage: string = '';
  showNotificationFlag: boolean = false;

  // Controle para animação da imagem do perfil
  isAboutImageVisible: boolean = false;

  constructor(
    private renderer: Renderer2, 
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient
  ) {
    // Criar cópias das configurações originais
    this.originalColors = this.siteColors.map(color => ({...color}));
    this.originalConfig = {...this.siteConfig};
  }

  ngOnInit(): void {
    // Inicializa os listeners de scroll
    this.scrollListener = window.addEventListener('scroll', this.checkScrollPosition.bind(this));
    
    // Carregar configurações salvas, se existirem
    this.loadSavedConfig();
  }

  ngOnDestroy(): void {
    // Remove listeners para evitar memory leaks
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  ngAfterViewInit(): void {
    // Adicionar propriedades para notificações
    this.notificationMessage = '';
    this.showNotificationFlag = false;
    
    // Inicialmente, definir a imagem como não visível
    this.isAboutImageVisible = false;
    
    // Verificar a posição de scroll após um curto atraso
    // (para garantir que todos os elementos estejam renderizados)
    setTimeout(() => {
      this.checkScrollPosition();
    }, 500);
  }
  
  // Dashboard Methods
  toggleAdminDashboard(): void {
    this.isAdminDashboardOpen = !this.isAdminDashboardOpen;
  }
  
  setActiveAdminTab(tabId: string): void {
    this.activeAdminTab = tabId;
  }
  
  updateColor(colorId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const colorIndex = this.siteColors.findIndex(c => c.id === colorId);
    
    if (colorIndex !== -1) {
      this.siteColors[colorIndex].value = input.value;
      
      // Aplicar a mudança imediatamente para visualização em tempo real
      document.documentElement.style.setProperty(
        this.siteColors[colorIndex].cssVar, 
        this.siteColors[colorIndex].value
      );
    }
  }
  
  updateConfig(): void {
    // Este método é chamado quando qualquer configuração é alterada
    console.log('Configuração atualizada:', this.siteConfig);
    
    // Aplicar mudanças em tempo real
    // Atualizar fonte
    this.loadFont(this.siteConfig.fonts.family);
    document.documentElement.style.setProperty('--title-size', `${this.siteConfig.layout.titleSize}px`);
    document.documentElement.style.setProperty('--text-size', `${this.siteConfig.layout.textSize}px`);
    
    // Atualizar layout
    document.documentElement.style.setProperty('--spacing', `${this.siteConfig.layout.spacing}px`);
    document.documentElement.style.setProperty('--border-radius', `${this.siteConfig.layout.borderRadius}px`);
    
    // Aplicar as atualizações visuais imediatamente
    const headings = document.querySelectorAll('h1, h2');
    const paragraphs = document.querySelectorAll('p');
    const elements = document.querySelectorAll('.portfolio-item, .contact-form, input, textarea, button');
    const sections = document.querySelectorAll('section');
    
    // Atualizar tamanhos de fonte
    headings.forEach(heading => {
      (heading as HTMLElement).style.fontSize = `${this.siteConfig.layout.titleSize * 0.8}px`;
    });
    
    paragraphs.forEach(paragraph => {
      (paragraph as HTMLElement).style.fontSize = `${this.siteConfig.layout.textSize}px`;
    });
    
    // Atualizar bordas
    elements.forEach(element => {
      (element as HTMLElement).style.borderRadius = `${this.siteConfig.layout.borderRadius}px`;
    });
    
    // Atualizar espaçamento
    sections.forEach(section => {
      (section as HTMLElement).style.padding = `${this.siteConfig.layout.spacing * 3}px 0`;
    });
    
    // Mostrar/esconder fundo circular
    if (this.bgCircular && this.bgCircular.nativeElement) {
      this.bgCircular.nativeElement.style.display = this.siteConfig.layout.showCircleBg ? 'block' : 'none';
    }
    
    // Atualizar velocidade de animação
    let animationMultiplier = 1;
    switch (this.siteConfig.animations.speed) {
      case 'slow': animationMultiplier = 1.5; break;
      case 'fast': animationMultiplier = 0.5; break;
      default: animationMultiplier = 1;
    }
    document.documentElement.style.setProperty('--animation-speed', `${animationMultiplier}`);
  }
  
  applyChanges(): void {
    // Aplicar mudanças de cores
    this.siteColors.forEach(color => {
      document.documentElement.style.setProperty(color.cssVar, color.value);
    });
    
    // Aplicar mudanças de fonte
    this.loadFont(this.siteConfig.fonts.family);
    document.documentElement.style.setProperty('--title-size', `${this.siteConfig.layout.titleSize}px`);
    document.documentElement.style.setProperty('--text-size', `${this.siteConfig.layout.textSize}px`);
    
    // Aplicar mudanças de layout
    document.documentElement.style.setProperty('--spacing', `${this.siteConfig.layout.spacing}px`);
    document.documentElement.style.setProperty('--border-radius', `${this.siteConfig.layout.borderRadius}px`);
    
    // Mostrar/esconder fundo circular
    if (this.bgCircular && this.bgCircular.nativeElement) {
      this.bgCircular.nativeElement.style.display = this.siteConfig.layout.showCircleBg ? 'block' : 'none';
    }
    
    // Aplicar velocidade de animação
    let animationMultiplier = 1;
    switch (this.siteConfig.animations.speed) {
      case 'slow': animationMultiplier = 1.5; break;
      case 'fast': animationMultiplier = 0.5; break;
      default: animationMultiplier = 1;
    }
    document.documentElement.style.setProperty('--animation-speed', `${animationMultiplier}`);
    
    // Atualizações em tempo real
    // Atualizar tamanhos de fonte
    const headings = document.querySelectorAll('h1, h2');
    const paragraphs = document.querySelectorAll('p');
    
    headings.forEach(heading => {
      (heading as HTMLElement).style.fontSize = `${this.siteConfig.layout.titleSize * 0.8}px`;
    });
    
    paragraphs.forEach(paragraph => {
      (paragraph as HTMLElement).style.fontSize = `${this.siteConfig.layout.textSize}px`;
    });
    
    // Atualizar bordas
    const elements = document.querySelectorAll('.portfolio-item, .contact-form, input, textarea, button');
    elements.forEach(element => {
      (element as HTMLElement).style.borderRadius = `${this.siteConfig.layout.borderRadius}px`;
    });
    
    // Atualizar espaçamento
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      (section as HTMLElement).style.padding = `${this.siteConfig.layout.spacing * 3}px 0`;
    });
    
    // Ativar/desativar paralaxe
    if (!this.siteConfig.layout.showCircleBg && this.bgCircular && this.bgCircular.nativeElement) {
      this.bgCircular.nativeElement.style.transform = 'translate(-50%, -50%)';
    }
  }
  
  async saveChanges(): Promise<void> {
    try {
      // Opção 1: Modificar diretamente o código-fonte
      const success = await this.modifySourceCode();
      
      if (success) {
        // Opção 2: Local Storage para backup
        localStorage.setItem('site-colors', JSON.stringify(this.siteColors));
        localStorage.setItem('site-config', JSON.stringify(this.siteConfig));
        
        // Opção 3: Gerar um arquivo CSS para download (backup)
        this.generateConfigFile();
        
        alert('Configurações salvas com sucesso no código-fonte!');
      } else {
        alert('Não foi possível salvar no código-fonte. Configurações salvas apenas no navegador.');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    }
  }
  
  async modifySourceCode(): Promise<boolean> {
    try {
      // Gerar o conteúdo para variáveis SCSS
      const scssContent = `// Variables - Core
$mint-green: ${this.siteColors.find(c => c.id === 'background')?.value || '#dfe4d1'};
$dark-text: ${this.siteColors.find(c => c.id === 'text')?.value || '#333333'};
$accent-color: ${this.siteColors.find(c => c.id === 'accent')?.value || '#ff4081'};
$section-bg-light: ${this.siteColors.find(c => c.id === 'sectionLight')?.value || '#ffffff'};
$section-bg-dark: ${this.siteColors.find(c => c.id === 'sectionDark')?.value || '#dfe4d1'};

// Typography
$main-font: '${this.siteConfig.fonts.family}', sans-serif;
$title-size: ${this.siteConfig.layout.titleSize}px;
$text-size: ${this.siteConfig.layout.textSize}px;

// Layout
$spacing: ${this.siteConfig.layout.spacing}px;
$border-radius: ${this.siteConfig.layout.borderRadius}px;

// Feature Flags
$show-background-circle: ${this.siteConfig.layout.showCircleBg};
$enable-parallax: ${this.siteConfig.layout.showCircleBg};
$animation-speed: ${this.siteConfig.animations.speed === 'slow' ? 1.5 : 
                    this.siteConfig.animations.speed === 'fast' ? 0.5 : 1};
`;

      // Usar a API Fetch para enviar as alterações para o servidor
      const response = await fetch('/api/update-scss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: scssContent,
          filePath: 'src/styles/_variables.scss' // Caminho para o arquivo de variáveis
        })
      });
      
      // Se não tiver um servidor back-end, podemos usar o LocalStorage como fallback
      if (!response.ok) {
        console.warn('Servidor não disponível para salvar alterações no código-fonte. Salvando apenas localmente.');
        
        // Criando um arquivo de texto para download com instruções
        const instructionsContent = `
# Instruções para Atualizar o Código-Fonte

Para aplicar estas mudanças diretamente no seu código-fonte, siga estas etapas:

1. Crie ou atualize o arquivo 'src/styles/_variables.scss' com este conteúdo:

\`\`\`scss
${scssContent}
\`\`\`

2. Importe este arquivo no seu arquivo styles.scss principal:

\`\`\`scss
@import './styles/variables';
\`\`\`

3. Execute o comando 'ng serve' para aplicar as mudanças.
`;
        
        const instructionsBlob = new Blob([instructionsContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(instructionsBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'update-instructions.txt';
        a.click();
        window.URL.revokeObjectURL(url);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao modificar código-fonte:', error);
      return false;
    }
  }
  
  resetChanges(): void {
    // Resetar cores para os valores originais
    this.siteColors = this.originalColors.map(color => ({...color}));
    
    // Resetar configurações para os valores originais
    this.siteConfig = {...this.originalConfig};
    
    // Aplicar mudanças
    this.applyChanges();
  }
  
  loadSavedConfig(): void {
    // Verificar se há configurações salvas no localStorage
    const savedColors = localStorage.getItem('site-colors');
    const savedConfig = localStorage.getItem('site-config');
    
    if (savedColors) {
      try {
        this.siteColors = JSON.parse(savedColors);
      } catch (e) {
        console.error('Erro ao carregar cores salvas:', e);
      }
    }
    
    if (savedConfig) {
      try {
        this.siteConfig = JSON.parse(savedConfig);
      } catch (e) {
        console.error('Erro ao carregar configurações salvas:', e);
      }
    }
    
    // Aplicar configurações carregadas
    this.applyChanges();
  }
  
  generateConfigFile(): void {
    // Gerar conteúdo CSS com as configurações atuais
    let cssContent = `:root {\n`;
    
    // Adicionar variáveis de cores
    this.siteColors.forEach(color => {
      cssContent += `  ${color.cssVar}: ${color.value};\n`;
    });
    
    // Adicionar outras variáveis
    cssContent += `  --title-size: ${this.siteConfig.layout.titleSize}px;\n`;
    cssContent += `  --text-size: ${this.siteConfig.layout.textSize}px;\n`;
    cssContent += `  --spacing: ${this.siteConfig.layout.spacing}px;\n`;
    cssContent += `  --border-radius: ${this.siteConfig.layout.borderRadius}px;\n`;
    
    // Fechar o bloco
    cssContent += `}\n\n`;
    
    // Adicionar regra para fonte
    cssContent += `body {\n`;
    cssContent += `  font-family: '${this.siteConfig.fonts.family}', sans-serif;\n`;
    cssContent += `}\n\n`;
    
    // Configuração para o fundo circular
    cssContent += `.background-circular {\n`;
    cssContent += `  display: ${this.siteConfig.layout.showCircleBg ? 'block' : 'none'};\n`;
    cssContent += `}\n\n`;
    
    // Configuração para velocidade de animações
    let animationMultiplier = 1;
    switch (this.siteConfig.animations.speed) {
      case 'slow': animationMultiplier = 1.5; break;
      case 'fast': animationMultiplier = 0.5; break;
      default: animationMultiplier = 1;
    }
    cssContent += `/* Multiplicador de velocidade de animação: ${animationMultiplier} */\n`;
    
    // Criar um arquivo para download
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-config.css';
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  loadFont(fontName: string): void {
    // Verificar se a fonte já foi carregada
    const fontLink = this.document.getElementById(`font-${fontName}`);
    if (fontLink) return;
    
    // Criar elemento de link para carregar a fonte
    const link = this.document.createElement('link');
    link.id = `font-${fontName}`;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;700&display=swap`;
    
    // Adicionar ao head
    this.document.head.appendChild(link);
    
    // Atualizar a fonte no body
    this.document.body.style.fontFamily = `'${fontName}', sans-serif`;
  }

  /**
   * Manipula o envio do formulário de contato
   * @param event Evento de submit do formulário
   */
  onSubmitContactForm(event: Event): void {
    event.preventDefault();
    
    // Aqui seria implementada a lógica de envio do formulário
    console.log('Formulário enviado:', this.contactForm);
    
    // Simulação de envio bem-sucedido
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    
    // Reset do formulário
    this.contactForm = {
      name: '',
      email: '',
      message: ''
    };
  }

  /**
   * Monitora o evento de scroll para aplicar efeito de paralaxe no fundo circular
   */
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event): void {
    if (this.siteConfig.layout.showCircleBg) {
      this.applyParallaxEffect();
    }
    this.checkScrollPosition();
  }
  
  /**
   * Aplica o efeito de paralaxe no fundo circular
   */
  private applyParallaxEffect(): void {
    if (this.bgCircular && this.bgCircular.nativeElement) {
      const scrollPosition = window.scrollY;
      const element = this.bgCircular.nativeElement;
      
      // Efeito de rotação suave
      const rotationValue = scrollPosition * 0.05;
      
      // Efeito de escala - encolhe ligeiramente ao rolar para baixo
      const scaleValue = 1 - (scrollPosition * 0.0003 > 0.15 ? 0.15 : scrollPosition * 0.0003);
      
      // Efeito de movimento vertical - sutilmente mais lento que o scroll normal
      const translateY = scrollPosition * 0.12;
      
      // Aplicando transformações
      element.style.transform = `translate(-50%, calc(-50% + ${translateY}px)) rotate(${rotationValue}deg) scale(${scaleValue})`;
      
      // Ajusta opacidade - fica mais transparente ao rolar para baixo, mas mantém uma boa visibilidade
      const opacityValue = 0.5 - (scrollPosition * 0.0001 > 0.2 ? 0.2 : scrollPosition * 0.0001);
      element.style.opacity = Math.max(0.3, opacityValue).toString();
    }
  }

  /**
   * Verifica a posição de scroll para atualizar animações conforme necessário
   */
  private checkScrollPosition(): void {
    // Verificar se a seção "about" está visível
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      const rect = aboutSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Considerar visível quando pelo menos 30% da seção está na tela
      const visibilityThreshold = 0.3;
      const visibleAmount = Math.min(windowHeight, rect.bottom) - Math.max(0, rect.top);
      const isVisibleEnough = visibleAmount > (rect.height * visibilityThreshold);
      
      // Se a imagem existe no DOM
      if (this.aboutImg && this.aboutImg.nativeElement) {
        const imgElement = this.aboutImg.nativeElement;
        
        // Se a seção estiver visível o suficiente e a imagem ainda não foi mostrada
        if (isVisibleEnough && !this.isAboutImageVisible) {
          this.isAboutImageVisible = true;
          
          // Tornar a imagem visível
          this.renderer.removeClass(imgElement, 'hidden-profile-img');
          this.renderer.addClass(imgElement, 'visible-profile-img');
          
          console.log('Imagem do perfil revelada!');
        } 
        // Se a seção não estiver mais visível, esconder a imagem novamente
        else if (!isVisibleEnough && this.isAboutImageVisible) {
          this.isAboutImageVisible = false;
          
          // Esconder a imagem
          this.renderer.removeClass(imgElement, 'visible-profile-img');
          this.renderer.addClass(imgElement, 'hidden-profile-img');
          
          console.log('Imagem do perfil escondida!');
        }
      }
    }
  }

  saveConfig() {
    // Solicitar senha antes de salvar
    const password = prompt('Digite sua senha do GitHub para salvar as alterações:');
    
    // Verificar se o usuário forneceu a senha
    if (!password) {
      this.showNotification('Operação cancelada. Senha não fornecida.');
      return;
    }
    
    // Salvar configurações no localStorage
    localStorage.setItem('siteConfig', JSON.stringify(this.siteConfig));
    
    // Gerar conteúdo SCSS
    const scssContent = this.generateScssContent();
    
    // Enviar para o backend para modificar o código-fonte
    this.http.post('http://localhost:3000/api/update-scss', {
      content: scssContent,
      filePath: 'src/styles/variables.scss',
      githubUser: 'a53833@alunos.ipb.pt',
      password: password
    }).subscribe({
      next: (response: any) => {
        console.log('Configurações salvas com sucesso:', response);
        this.showNotification('Configurações salvas! O código-fonte foi atualizado.');
      },
      error: (error) => {
        console.error('Erro ao salvar configurações:', error);
        this.showNotification('Ocorreu um erro ao salvar. Verifique as credenciais ou se o servidor backend está em execução.');
        
        // Fallback: Criar arquivo para download
        this.downloadScssFile(scssContent);
      }
    });
  }

  generateScssContent() {
    const { colors, fonts, layout, animations } = this.siteConfig;
    
    // Gerar variáveis SCSS baseadas na configuração atual
    return `// Arquivo gerado automaticamente pelo painel de configuração
// Última atualização: ${new Date().toLocaleString()}

// Cores
$primary-color: ${colors.primary};
$secondary-color: ${colors.secondary};
$accent-color: ${colors.accent};
$text-color: ${colors.text};
$background-color: ${colors.background};

// Tipografia
$font-family: '${fonts.family}', sans-serif;
$title-size: ${layout.titleSize}px;
$text-size: ${layout.textSize}px;

// Layout
$spacing: ${layout.spacing}px;
$border-radius: ${layout.borderRadius}px;
$show-circle-bg: ${layout.showCircleBg};

// Animações
$animation-speed: ${animations.speed};
`;
  }

  downloadScssFile(content: string) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'variables.scss');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  showNotification(message: string) {
    this.notificationMessage = message;
    this.showNotificationFlag = true;
    
    setTimeout(() => {
      this.showNotificationFlag = false;
    }, 5000);
  }
}

/**
 * Interface para os itens do portfólio
 */
interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

/**
 * Interface para informações do designer/artista
 */
interface DesignerInfo {
  name: string;
  bio: string;
  imageUrl: string;
}

/**
 * Interface para o formulário de contato
 */
interface ContactForm {
  name: string;
  email: string;
  message: string;
}

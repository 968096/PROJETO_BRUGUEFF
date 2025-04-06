import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HomeComponent],
  template: `
    <header class="site-header" [ngClass]="{'scrolled': isScrolled}">
      <div class="container">
        <div class="header-inner">
          <div class="logo" (click)="scrollToTop()" role="button" tabindex="0" title="Voltar ao início">
            <img src="assets/images/Ativo 1.png" alt="Logo FEFE" class="logo-img">
          </div>
          <div class="header-controls">
            <button class="theme-toggle" aria-label="Alternar Tema" (click)="toggleTheme()">
              <i class="theme-icon" [ngClass]="isDarkTheme ? 'light-icon' : 'dark-icon'"></i>
            </button>
            <button class="menu-toggle" aria-label="Toggle Menu" (click)="toggleMenu()">
              <img src="assets/images/iconemenu.png" alt="Menu" class="menu-icon">
            </button>
          </div>
          <nav class="main-nav" [class.active]="isMenuOpen">
            <ul>
              <li><a href="#" (click)="scrollToSection($event, 'top')" [class.active]="activeSection === 'top'">Início</a></li>
              <li><a href="#portfolio" (click)="scrollToSection($event, 'portfolio')" [class.active]="activeSection === 'portfolio'">Portfólio</a></li>
              <li><a href="#about" (click)="scrollToSection($event, 'about')" [class.active]="activeSection === 'about'">Sobre</a></li>
              <li><a href="#contact" (click)="scrollToSection($event, 'contact')" [class.active]="activeSection === 'contact'">Contato</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
    <div class="menu-overlay" *ngIf="isMenuOpen" (click)="toggleMenu()"></div>
    <app-home></app-home>
  `,
  styles: [`
    :host {
      --mint-green: #dfe4d1;
      --dark-text: #333;
      --accent-color: #ff4081;
      --background-color: var(--mint-green);
      --text-color: var(--dark-text);
    }
    
    :host-context(.dark-theme) {
      --background-color: #000;
      --text-color: #dfe4d1;
      --mint-green: #000;
      --dark-text: #dfe4d1;
    }
    
    .site-header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      padding: 20px 0;
      z-index: 100;
      transition: all 0.3s ease;
      background-color: var(--background-color);
    }
    
    .site-header.scrolled {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 12px 0;
    }
    
    .header-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }
    
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    
    .logo:hover {
      transform: scale(1.05);
    }
    
    .logo:active {
      transform: scale(0.95);
    }
    
    .logo-img {
      height: 45px;
      width: auto;
      transition: all 0.3s ease;
    }
    
    .scrolled .logo-img {
      height: 40px;
    }
    
    .header-controls {
      display: flex;
      align-items: center;
    }
    
    .theme-toggle {
      background: transparent;
      border: none;
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .theme-toggle:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    .theme-icon {
      width: 24px;
      height: 24px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
    
    .dark-icon {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23333'%3E%3Cpath d='M12 11.807A9.002 9.002 0 0 1 10.049 2a9.942 9.942 0 0 0-5.12 2.735c-3.905 3.905-3.905 10.237 0 14.142 3.906 3.906 10.237 3.905 14.143 0a9.946 9.946 0 0 0 2.735-5.119A9.003 9.003 0 0 1 12 11.807z'%3E%3C/path%3E%3C/svg%3E");
    }
    
    .light-icon {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23dfe4d1'%3E%3Cpath d='M6.995 12c0 2.761 2.246 5.007 5.007 5.007s5.007-2.246 5.007-5.007-2.246-5.007-5.007-5.007S6.995 9.239 6.995 12zM11 19h2v3h-2zm0-17h2v3h-2zm-9 9h3v2H2zm17 0h3v2h-3zM5.637 19.778l-1.414-1.414 2.121-2.121 1.414 1.414zM16.242 6.344l2.122-2.122 1.414 1.414-2.122 2.122zM6.344 7.759 4.223 5.637l1.415-1.414 2.12 2.122zm13.434 10.605-1.414 1.414-2.122-2.122 1.414-1.414z'%3E%3C/path%3E%3C/svg%3E");
    }
    
    .menu-toggle {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 101;
    }
    
    .menu-icon {
      width: 30px;
      height: auto;
      transition: all 0.3s ease;
    }
    
    .main-nav {
      position: fixed;
      top: 0;
      right: -250px;
      width: 250px;
      height: 100vh;
      background-color: var(--background-color);
      padding: 80px 20px 20px;
      transition: right 0.3s ease;
      z-index: 100;
      box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    }
    
    .main-nav.active {
      right: 0;
    }
    
    .main-nav ul {
      display: flex;
      flex-direction: column;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .main-nav li {
      margin: 15px 0;
    }
    
    .main-nav a {
      color: var(--text-color);
      text-decoration: none;
      font-weight: 500;
      font-size: 1.1rem;
      transition: color 0.3s ease;
      position: relative;
      padding-bottom: 5px;
    }
    
    .main-nav a:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background-color: var(--accent-color);
      transition: width 0.3s ease;
    }
    
    .main-nav a:hover:after, 
    .main-nav a.active:after {
      width: 100%;
    }
    
    .main-nav a:hover, 
    .main-nav a.active {
      color: var(--accent-color);
    }
    
    .menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 99;
      display: none;
    }
    
    .menu-overlay {
      display: block;
    }
    
    @media (min-width: 769px) {
      .header-controls {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Portfolio de Design';
  isMenuOpen = false;
  isScrolled = false;
  activeSection = 'top';
  sections: { [key: string]: number } = {};
  isDarkTheme = false;
  
  constructor(private renderer: Renderer2) {}
  
  ngOnInit() {
    // Verificar se há preferência de tema salva
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.enableDarkTheme();
    }
    
    // Inicializar depois que o DOM estiver carregado
    setTimeout(() => {
      this.updateSectionPositions();
      this.checkActiveSection();
    }, 1000);
  }
  
  @HostListener('window:scroll')
  onWindowScroll() {
    // Verifica se a página foi rolada
    this.isScrolled = window.scrollY > 50;
    
    // Atualiza a seção ativa
    this.checkActiveSection();
  }
  
  @HostListener('window:resize')
  onWindowResize() {
    // Atualiza as posições das seções quando a janela é redimensionada
    this.updateSectionPositions();
  }
  
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    this.activeSection = 'top';
  }
  
  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    
    if (this.isDarkTheme) {
      this.enableDarkTheme();
    } else {
      this.disableDarkTheme();
    }
    
    // Salvar preferência
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }
  
  enableDarkTheme() {
    this.isDarkTheme = true;
    this.renderer.addClass(document.body, 'dark-theme');
  }
  
  disableDarkTheme() {
    this.isDarkTheme = false;
    this.renderer.removeClass(document.body, 'dark-theme');
  }
  
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    
    // Impede o scroll quando o menu estiver aberto
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }
  
  scrollToSection(event: Event, sectionId: string) {
    event.preventDefault();
    
    const element = sectionId === 'top' 
      ? document.body 
      : document.getElementById(sectionId);
      
    if (element) {
      const headerOffset = 80;
      const elementPosition = sectionId === 'top' 
        ? 0 
        : element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Fecha o menu após clicar em um link (apenas em mobile)
      if (this.isMenuOpen) {
        this.toggleMenu();
      }
      
      this.activeSection = sectionId;
    }
  }
  
  private updateSectionPositions() {
    this.sections = {
      top: 0,
      portfolio: this.getOffsetTop('portfolio'),
      about: this.getOffsetTop('about'),
      contact: this.getOffsetTop('contact')
    };
  }
  
  private getOffsetTop(id: string): number {
    const element = document.getElementById(id);
    return element 
      ? element.getBoundingClientRect().top + window.pageYOffset - 100
      : 0;
  }
  
  private checkActiveSection() {
    const scrollPosition = window.scrollY;
    
    if (scrollPosition < this.sections['portfolio'] - 100) {
      this.activeSection = 'top';
    } else if (scrollPosition < this.sections['about'] - 100) {
      this.activeSection = 'portfolio';
    } else if (scrollPosition < this.sections['contact'] - 100) {
      this.activeSection = 'about';
    } else {
      this.activeSection = 'contact';
    }
  }
}

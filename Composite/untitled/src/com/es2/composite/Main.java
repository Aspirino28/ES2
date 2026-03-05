package com.es2.composite;

public class Main {
    public static void main(String[] args) {
        // --- NÍVEL 1: O Menu Raiz ---
        SubMenu menuPrincipal = new SubMenu();
        menuPrincipal.setLabel("1. Menu Principal");

        // --- NÍVEL 2: Os Submenus ---
        SubMenu menuArquivo = new SubMenu();
        menuArquivo.setLabel("  1.1. Arquivo");

        SubMenu menuEditar = new SubMenu();
        menuEditar.setLabel("  1.2. Editar");

        // --- NÍVEL 3: As Folhas (Links) ---
        Link linkNovo = new Link();
        linkNovo.setLabel("    1.1.1. Novo Arquivo");

        Link linkAbrir = new Link();
        linkAbrir.setLabel("    1.1.2. Abrir Arquivo");

        Link linkCopiar = new Link();
        linkCopiar.setLabel("    1.2.1. Copiar");

        Link linkColar = new Link();
        linkColar.setLabel("    1.2.2. Colar");

        // --- MONTANDO A ÁRVORE ---
        // Adicionando os links (Nível 3) dentro dos seus respectivos submenus (Nível 2)
        menuArquivo.addChild(linkNovo);
        menuArquivo.addChild(linkAbrir);

        menuEditar.addChild(linkCopiar);
        menuEditar.addChild(linkColar);

        // Adicionando os submenus (Nível 2) dentro do menu principal (Nível 1)
        menuPrincipal.addChild(menuArquivo);
        menuPrincipal.addChild(menuEditar);

        // --- EXECUTANDO ---
        System.out.println("Imprimindo a árvore de menus:\n");

        // A mágica do Composite acontece aqui. Essa única chamada percorre tudo.
        menuPrincipal.showOptions();
    }
}
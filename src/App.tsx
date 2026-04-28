import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShoppingBag, 
  Star, 
  TrendingUp, 
  ChevronRight, 
  ExternalLink,
  Menu,
  X,
  Tag,
  Clock,
  User,
  Lock,
  Mail,
  Shield,
  Heart,
  Share2,
  Plus,
  Trash2,
  Edit3,
  LayoutDashboard,
  LogOut,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Loader2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { GoogleGenAI, Type } from "@google/genai";

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types & Data ---
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  affiliateUrl: string;
  rating: number;
  reviews: number;
  isHot?: boolean;
}

const productsData: Product[] = [
  {
    id: '1',
    name: 'Smartphone Galaxy S24 Ultra',
    description: 'O smartphone mais avançado com IA integrada e câmera de 200MP.',
    price: 6499.00,
    originalPrice: 8999.00,
    category: 'Eletrônicos',
    image: 'https://picsum.photos/seed/s24/600/600',
    affiliateUrl: 'https://www.google.com/search?q=Galaxy+S24+Ultra',
    rating: 4.9,
    reviews: 1240,
    isHot: true,
  },
  {
    id: '2',
    name: 'Notebook Gamer Dell G15',
    description: 'Potência extrema para seus jogos com RTX 4050 e processador i7.',
    price: 5299.00,
    originalPrice: 6500.00,
    category: 'Informática',
    image: 'https://picsum.photos/seed/dellg15/600/600',
    affiliateUrl: 'https://www.google.com/search?q=Dell+G15',
    rating: 4.7,
    reviews: 850,
  },
  {
    id: '3',
    name: 'Fone de Ouvido Sony WH-1000XM5',
    description: 'O melhor cancelamento de ruído do mercado com som de alta fidelidade.',
    price: 1899.00,
    originalPrice: 2499.00,
    category: 'Áudio',
    image: 'https://picsum.photos/seed/sony/600/600',
    affiliateUrl: 'https://www.google.com/search?q=Sony+WH-1000XM5',
    rating: 4.8,
    reviews: 2100,
    isHot: true,
  },
  {
    id: '4',
    name: 'Kindle Paperwhite 16GB',
    description: 'Leitura confortável em qualquer lugar com tela de 6.8" e luz ajustável.',
    price: 799.00,
    originalPrice: 899.00,
    category: 'Eletrônicos',
    image: 'https://picsum.photos/seed/kindle/600/600',
    affiliateUrl: 'https://www.google.com/search?q=Kindle+Paperwhite',
    rating: 4.9,
    reviews: 15400,
  },
  {
    id: '5',
    name: 'Cadeira Gamer Ergonômica',
    description: 'Conforto total para longas sessões de trabalho ou jogo.',
    price: 899.00,
    originalPrice: 1299.00,
    category: 'Móveis',
    image: 'https://picsum.photos/seed/chair/600/600',
    affiliateUrl: 'https://www.google.com/search?q=Cadeira+Gamer',
    rating: 4.5,
    reviews: 430,
  },
  {
    id: '6',
    name: 'Smartwatch Apple Watch Series 9',
    description: 'Sua saúde e conectividade sempre no pulso com tela Retina sempre ativa.',
    price: 3299.00,
    originalPrice: 4199.00,
    category: 'Eletrônicos',
    image: 'https://picsum.photos/seed/applewatch/600/600',
    affiliateUrl: 'https://www.google.com/search?q=Apple+Watch+Series+9',
    rating: 4.8,
    reviews: 920,
  },
];

const defaultCategories = ['Eletrônicos', 'Informática', 'Áudio', 'Móveis'];

export default function App() {
  const [appCategories, setAppCategories] = useState<string[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'register' | 'admin'>('register');
  const [scrolled, setScrolled] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');
  const [adminProducts, setAdminProducts] = useState<Product[]>(productsData);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [leads, setLeads] = useState<{ id: string; name: string; contact: string; type: string; message: string; date: string }[]>([]);
  const [adminTab, setAdminTab] = useState<'products' | 'leads' | 'categories'>('products');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ index: number; name: string } | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');

  useEffect(() => {
    const savedProducts = localStorage.getItem('affiliate_products');
    if (savedProducts) {
      setAdminProducts(JSON.parse(savedProducts));
    }
    const savedLeads = localStorage.getItem('affiliate_leads');
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    }
    const savedCategories = localStorage.getItem('affiliate_categories');
    if (savedCategories) {
      setAppCategories(JSON.parse(savedCategories));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('affiliate_products', JSON.stringify(adminProducts));
  }, [adminProducts]);

  useEffect(() => {
    localStorage.setItem('affiliate_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('affiliate_categories', JSON.stringify(appCategories));
  }, [appCategories]);

  // Helper to get categories including 'Todos'
  const displayCategories = useMemo(() => ['Todos', ...appCategories], [appCategories]);

  const filteredProducts = useMemo(() => {
    return adminProducts.filter(product => {
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, adminProducts]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated login
    setIsAdminLoggedIn(true);
    setIsAuthModalOpen(false);
    setCurrentView('admin');
  };

  const handleDeleteProduct = (id: string) => {
    setAdminProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newLead = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      contact: formData.get('contact') as string,
      type: formData.get('type') as string || 'Pedido',
      message: formData.get('message') as string,
      date: new Date().toISOString(),
    };
    setLeads(prev => [newLead, ...prev]);
    (e.target as HTMLFormElement).reset();
    alert('Sua solicitação foi enviada! Nossa equipe entrará em contato.');
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryNameInput.trim()) return;

    if (editingCategory) {
      const oldName = appCategories[editingCategory.index];
      const newName = categoryNameInput.trim();
      
      setAppCategories(prev => {
        const next = [...prev];
        next[editingCategory.index] = newName;
        return next;
      });

      // Update products that were in the old category
      setAdminProducts(prev => prev.map(p => p.category === oldName ? { ...p, category: newName } : p));
    } else {
      setAppCategories(prev => [...prev, categoryNameInput.trim()]);
    }

    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryNameInput('');
  };

  const handleDeleteCategory = (index: number) => {
    const categoryToDelete = appCategories[index];
    if (confirm(`Tem certeza que deseja excluir a categoria "${categoryToDelete}"? Produtos vinculados ficarão sem categoria.`)) {
      setAppCategories(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAutoFill = async (url: string) => {
    if (!url || !url.startsWith('http')) {
      alert("Por favor, insira um link válido.");
      return;
    }
    setIsAutoFilling(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract product information from this URL: ${url}. 
        Provide the name, a short description (max 100 chars), a estimated price in BRL (number), and suggest a category from: ${appCategories.join(', ')}.`,
        config: {
          tools: [{ urlContext: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.NUMBER },
              category: { type: Type.STRING }
            },
            required: ["name", "description", "price", "category"]
          }
        }
      });
      
      const data = JSON.parse(response.text);
      setEditingProduct(prev => ({
        ...(prev || { id: '', image: 'https://picsum.photos/seed/' + Math.random() + '/800/800', affiliateUrl: url, isHot: false }),
        ...data,
        affiliateUrl: url
      }));
      setModalKey(prev => prev + 1);
    } catch (error) {
      console.error("Error auto-filling:", error);
      alert("Não foi possível extrair os dados automaticamente. Tente preencher manualmente.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleDeleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const productData: Partial<Product> = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      originalPrice: formData.get('originalPrice') ? parseFloat(formData.get('originalPrice') as string) : undefined,
      category: formData.get('category') as string,
      image: formData.get('image') as string || 'https://picsum.photos/seed/product/800/800',
      affiliateUrl: formData.get('affiliateUrl') as string,
      isHot: (formData.get('isHot') === 'on'),
    };

    if (editingProduct) {
      setAdminProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
    } else {
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        ...productData as Product,
      };
      setAdminProducts(prev => [newProduct, ...prev]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className={cn(
        "sticky top-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-slate-900/80 backdrop-blur-xl border-slate-700/50 py-2 shadow-2xl" 
          : "bg-transparent py-4 border-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setCurrentView('store')}>
              <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <ShoppingBag size={22} />
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-white">
                DStory<span className="text-purple-400"></span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {currentView === 'store' ? (
                <>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors" size={16} />
                    <input
                      type="text"
                      placeholder="Buscar ofertas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-400 focus:bg-white/20 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-64 transition-all outline-none"
                    />
                  </div>
                  
                  <div className="h-6 w-px bg-white/10"></div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => { setAuthTab('register'); setIsAuthModalOpen(true); }}
                      className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
                    >
                      Cadastrar
                    </button>
                    
                    {isAdminLoggedIn ? (
                      <button 
                        onClick={() => setCurrentView('admin')}
                        className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-500 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
                      >
                        <LayoutDashboard size={16} /> Dashboard
                      </button>
                    ) : (
                      <button 
                        onClick={() => { setAuthTab('admin'); setIsAuthModalOpen(true); }}
                        className="px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                      >
                        <Shield size={16} /> Painel Admin
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setCurrentView('store')}
                    className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
                  >
                    Ver Loja
                  </button>
                  <button 
                    onClick={() => { setIsAdminLoggedIn(false); setCurrentView('store'); }}
                    className="px-5 py-2.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-sm font-bold hover:bg-rose-500/30 transition-all flex items-center gap-2"
                  >
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-slate-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900 border-t border-white/5 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar ofertas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => { setAuthTab('register'); setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold"
                  >
                    Cadastrar
                  </button>
                  <button
                    onClick={() => { setAuthTab('admin'); setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="w-full px-4 py-3 bg-white/10 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Shield size={18} /> Painel Admin
                  </button>
                </div>
                
                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Categorias</p>
                  <div className="grid grid-cols-2 gap-2">
                    {displayCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsMenuOpen(false);
                        }}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium text-left",
                          selectedCategory === cat ? "bg-purple-900/40 text-purple-400" : "bg-white/5 text-slate-400"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow">
        {currentView === 'store' ? (
          <>
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden bg-transparent">
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.15),transparent_70%)]"></div>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-2xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <h1 className="text-6xl md:text-9xl font-display font-black mb-6 tracking-tighter leading-none">
                      <span className="bg-gradient-to-br from-amber-400 via-amber-300 to-amber-600 bg-clip-text text-transparent drop-shadow-lg">D</span>
                      <span className="text-white drop-shadow-lg">Story</span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-lg mx-auto font-medium">
                      Descubra produtos incríveis e seleções exclusivas.
                    </p>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Categories Section */}
            <section id="categories-section" className="py-6 bg-slate-900/40 backdrop-blur-md border-y border-white/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap justify-center gap-2">
                  {displayCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-bold transition-all border",
                        selectedCategory === cat 
                          ? "bg-purple-600 text-white border-purple-600 shadow-xl shadow-purple-500/20" 
                          : "bg-white/5 text-slate-300 border-white/10 hover:border-white/30 hover:bg-white/10"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Products Section */}
            <section id="products" className="py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                    {selectedCategory === 'Todos' ? 'Curadoria DStory' : selectedCategory}
                  </h2>
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                    <span className="text-xs font-bold text-slate-400">{filteredProducts.length} itens</span>
                  </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full relative"
                      >
                        <div className="relative aspect-square overflow-hidden bg-slate-100">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          
                          <div className="absolute top-3 left-3 flex flex-col gap-1">
                            {product.isHot && (
                              <div className="px-2 py-0.5 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-md shadow-sm">
                                Hot
                              </div>
                            )}
                            {product.originalPrice && (
                              <div className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest rounded-md shadow-sm">
                                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-5 flex flex-col flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">
                              {product.category}
                            </span>
                          </div>

                          <h3 className="text-base font-display font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>

                          <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div>
                              {product.originalPrice && (
                                <span className="block text-[10px] text-slate-400 line-through">
                                  R$ {product.originalPrice.toFixed(2)}
                                </span>
                              )}
                              <span className="text-lg font-display font-black text-slate-900">
                                R$ {product.price.toFixed(2)}
                              </span>
                            </div>
                            <a 
                              href={product.affiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-purple-600 transition-all flex items-center gap-2"
                            >
                              Comprar <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                      <Search size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum produto encontrado</h3>
                    <p className="text-slate-500">Tente ajustar sua busca ou categoria para encontrar o que procura.</p>
                    <button 
                      onClick={() => {
                        setSelectedCategory('Todos');
                        setSearchQuery('');
                      }}
                      className="mt-6 text-purple-600 font-bold hover:underline"
                    >
                      Limpar todos os filtros
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Interaction Section */}
            <section className="py-24 bg-transparent relative overflow-hidden">
              <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                <h2 className="text-4xl font-display font-extrabold text-white mb-4 tracking-tight">
                  Não encontrou o que procurava?
                </h2>
                <p className="text-slate-300 mb-10 text-lg max-w-2xl mx-auto leading-relaxed">
                  Nossa equipe pode encontrar ofertas personalizadas para você gratuitamente.
                </p>
                
                <form className="flex flex-col gap-5 max-w-xl mx-auto text-left bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl" onSubmit={handleLeadSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome</label>
                      <input 
                        type="text" 
                        name="name"
                        placeholder="Seu Nome"
                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border-2 border-transparent focus:border-purple-500/50 focus:bg-white/10 text-white font-bold outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contato</label>
                      <input 
                        type="text" 
                        name="contact"
                        placeholder="WhatsApp ou E-mail"
                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border-2 border-transparent focus:border-purple-500/50 focus:bg-white/10 text-white font-bold outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Solicitação</label>
                    <div className="bg-white/5 p-1 rounded-2xl flex flex-wrap gap-1">
                      {['Pedido', 'Novidades', 'Ideia'].map((type) => (
                        <label
                          key={type}
                          className="flex-grow cursor-pointer"
                        >
                          <input type="radio" name="type" value={type} className="hidden peer" defaultChecked={type === 'Pedido'} />
                          <div className="px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-400 hover:bg-white/5 peer-checked:bg-white peer-checked:text-purple-600 text-center">
                            {type}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mensagem</label>
                    <textarea 
                      name="message"
                      placeholder="Descreva detalhadamente o produto ou oferta que busca..."
                      rows={4}
                      className="w-full px-6 py-4 rounded-2xl bg-white/5 border-2 border-transparent focus:border-purple-500/50 focus:bg-white/10 text-white font-bold resize-none outline-none transition-all"
                      required
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 group">
                    Enviar Solicitação 
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            </section>
          </>
        ) : (
          <section className="py-12 bg-transparent min-h-[80vh]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <h1 className="text-3xl font-display font-bold text-white tracking-tight">Painel Administrativo</h1>
                  <p className="text-slate-400">Gerencie seus produtos e solicitações</p>
                </div>
                  <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
                    <button 
                      onClick={() => setAdminTab('products')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        adminTab === 'products' ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-slate-400 hover:text-slate-200"
                      )}
                    >
                      <ShoppingBag size={16} /> Produtos
                    </button>
                    <button 
                      onClick={() => setAdminTab('categories')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        adminTab === 'categories' ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-slate-400 hover:text-slate-200"
                      )}
                    >
                      <Tag size={16} /> Categorias
                    </button>
                    <button 
                      onClick={() => setAdminTab('leads')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        adminTab === 'leads' ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-slate-400 hover:text-slate-200"
                      )}
                    >
                      <MessageSquare size={16} /> Solicitações
                      {leads.length > 0 && (
                        <span className="w-5 h-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full">
                          {leads.length}
                        </span>
                      )}
                    </button>
                  </div>
              </div>

              {adminTab === 'products' ? (
                <div className="space-y-12">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Tag size={20} className="text-purple-400" /> Listagem de Produtos
                    </h2>
                    <button 
                      onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/40"
                    >
                      <Plus size={20} /> Novo Produto
                    </button>
                  </div>

                  {appCategories.map(category => {
                    const categoryProducts = adminProducts.filter(p => p.category === category);
                    if (categoryProducts.length === 0) return null;

                    return (
                      <div key={category} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-px flex-grow bg-white/10"></div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{category}</span>
                          <div className="h-px flex-grow bg-white/10"></div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Produto</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Preço</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-right">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {categoryProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-4 text-left">
                                      <img src={product.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                                      <div>
                                        <div className="font-bold text-white flex items-center gap-2">
                                          {product.name}
                                          {product.isHot && <Sparkles size={14} className="text-amber-400" />}
                                        </div>
                                        <div className="text-xs text-slate-400 truncate max-w-[300px]">{product.description}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="font-bold text-white">R$ {product.price.toFixed(2)}</div>
                                    {product.originalPrice && (
                                      <div className="text-xs text-slate-500 line-through">R$ {product.originalPrice.toFixed(2)}</div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2 text-right">
                                      <button 
                                        onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                                        className="p-2 text-slate-400 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-all"
                                      >
                                        <Edit3 size={18} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : adminTab === 'categories' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Tag size={20} className="text-purple-400" /> Tópicos / Categorias
                    </h2>
                    <button 
                      onClick={() => { setEditingCategory(null); setCategoryNameInput(''); setIsCategoryModalOpen(true); }}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/40"
                    >
                      <Plus size={20} /> Novo Tópico
                    </button>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-slate-400">
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Nome do Tópico</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Produtos Vinculados</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {appCategories.map((cat, index) => (
                          <tr key={index} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white">{cat}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-400 text-sm">
                              {adminProducts.filter(p => p.category === cat).length} produtos
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 text-right">
                                <button 
                                  onClick={() => { 
                                    setEditingCategory({ index, name: cat }); 
                                    setCategoryNameInput(cat);
                                    setIsCategoryModalOpen(true); 
                                  }}
                                  className="p-2 text-slate-400 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-all"
                                >
                                  <Edit3 size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCategory(index)}
                                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare size={20} className="text-purple-400" /> Solicitações de Usuários
                  </h2>
                  
                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-slate-400">
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Usuário</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Tipo</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Mensagem</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Data</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {leads.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">
                              Nenhuma solicitação recebida ainda.
                            </td>
                          </tr>
                        ) : (
                          leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-white">{lead.name}</div>
                                <div className="text-xs text-slate-400">{lead.contact}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider",
                                  lead.type === 'Pedido' ? "bg-purple-900/40 text-purple-400 border border-purple-500/30" :
                                  lead.type === 'Novidades' ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/30" : "bg-amber-900/40 text-amber-400 border border-amber-500/30"
                                )}>
                                  {lead.type}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-slate-300 max-w-[400px]">{lead.message}</div>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-500">
                                {new Date(lead.date).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Simplified Footer */}
      <footer className="bg-transparent py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm font-medium">
            © 2026 DStory. Todos os direitos reservados.
          </p>
        </div>
      </footer>
      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center text-white">
                      <Shield size={20} />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-slate-900">Acesso</h2>
                  </div>
                  <button onClick={() => setIsAuthModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                  <button 
                    onClick={() => setAuthTab('register')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      authTab === 'register' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Cadastro
                  </button>
                  <button 
                    onClick={() => setAuthTab('admin')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      authTab === 'admin' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Admin
                  </button>
                </div>

                {authTab === 'register' ? (
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu Nome</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="João Silva"
                          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="email" 
                          placeholder="seu@email.com"
                          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                          required
                        />
                      </div>
                    </div>
                    <button className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-purple-100 flex items-center justify-center gap-2">
                      Criar Conta <ChevronRight size={18} />
                    </button>
                  </form>
                ) : (
                  <form className="space-y-6" onSubmit={handleAdminLogin}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="email" 
                          placeholder="admin@exemplo.com"
                          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                          required
                        />
                      </div>
                    </div>
                    <button className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-purple-100 flex items-center justify-center gap-2">
                      Acessar Painel <ChevronRight size={18} />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Management Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <form key={modalKey} className="p-8" onSubmit={handleSaveProduct}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-display font-bold text-slate-900">
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </h2>
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL de Afiliado</label>
                    <div className="flex gap-2">
                      <input 
                        name="affiliateUrl"
                        id="affiliateUrlInput"
                        defaultValue={editingProduct?.affiliateUrl}
                        placeholder="https://amazon.com.br/..."
                        className="flex-grow px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                        required
                      />
                      <button 
                        type="button"
                        disabled={isAutoFilling}
                        onClick={() => {
                          const input = document.getElementById('affiliateUrlInput') as HTMLInputElement;
                          handleAutoFill(input.value);
                        }}
                        className="px-6 py-4 bg-purple-50 text-purple-600 rounded-2xl font-bold hover:bg-purple-100 transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                      >
                        {isAutoFilling ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        Auto-preencher
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 ml-1">Insira o link e clique em Auto-preencher para carregar os dados via IA.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Produto</label>
                    <input 
                      name="name"
                      defaultValue={editingProduct?.name}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                    <select 
                      name="category"
                      defaultValue={editingProduct?.category || appCategories[0]}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900 appearance-none"
                    >
                      {appCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço Atual (R$)</label>
                    <input 
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.price}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço Original (R$ - Opcional)</label>
                    <input 
                      name="originalPrice"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.originalPrice}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL da Imagem</label>
                    <input 
                      name="image"
                      defaultValue={editingProduct?.image}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                    <textarea 
                      name="description"
                      defaultValue={editingProduct?.description}
                      rows={3}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900 resize-none"
                      required
                    ></textarea>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      name="isHot"
                      id="isHot"
                      defaultChecked={editingProduct?.isHot}
                      className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="isHot" className="text-sm font-bold text-slate-700">Marcar como Oferta "Hot"</label>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-500 transition-all shadow-lg shadow-purple-100"
                  >
                    Salvar Produto
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Management Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <form className="p-8" onSubmit={handleSaveCategory}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-display font-bold text-slate-900">
                    {editingCategory ? 'Editar Tópico' : 'Novo Tópico'}
                  </h2>
                  <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Tópico</label>
                    <input 
                      value={categoryNameInput}
                      onChange={(e) => setCategoryNameInput(e.target.value)}
                      placeholder="Ex: Games, Casa, Beleza..."
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-500 transition-all shadow-lg shadow-purple-100"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

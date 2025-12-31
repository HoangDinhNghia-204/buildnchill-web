import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import mockData from '../data/mockData.json';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [serverStatus, setServerStatus] = useState({
    status: 'Online',
    players: '0',
    maxPlayers: '20',
    version: '1.21.4',
    uptime: '99.9%'
  });
  const [contacts, setContacts] = useState([]);
  const [siteSettings, setSiteSettings] = useState({
    server_ip: 'buildnchill.ddns.net:25604',
    server_version: '> 1.21.4',
    contact_email: 'apphoang2004@gmail.com',
    contact_phone: '+84 373 796 601',
    discord_url: 'https://discord.gg/Kum6Wvz23P',
    site_title: 'BuildnChill',
    maintenance_mode: false
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    loadData();
    
    // Check if Supabase is configured before subscribing
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured. Real-time updates disabled.');
      return;
    }
    
    // Subscribe to real-time changes
    let newsSubscription, statusSubscription, contactsSubscription, settingsSubscription;
    
    try {
      newsSubscription = supabase
        .channel('news_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'news' },
          () => {
            loadNews();
          }
        )
        .subscribe();

      statusSubscription = supabase
        .channel('status_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'server_status' },
          () => {
            loadServerStatus();
          }
        )
        .subscribe();

      contactsSubscription = supabase
        .channel('contacts_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'contacts' },
          () => {
            loadContacts();
          }
        )
        .subscribe();

      settingsSubscription = supabase
        .channel('settings_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'site_settings' },
          () => {
            loadSiteSettings();
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Error setting up real-time subscriptions:', error);
    }

    // Check authentication on mount
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      // Load contacts if admin is authenticated
      loadContacts();
    }

    return () => {
      if (newsSubscription) newsSubscription.unsubscribe();
      if (statusSubscription) statusSubscription.unsubscribe();
      if (contactsSubscription) contactsSubscription.unsubscribe();
      if (settingsSubscription) settingsSubscription.unsubscribe();
    };
  }, []);

  // Load contacts when admin logs in
  useEffect(() => {
    if (isAuthenticated) {
      loadContacts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadNews(),
        loadServerStatus(),
        loadSiteSettings()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to mock data if Supabase fails
      setNews(mockData.news);
      setServerStatus(mockData.serverStatus);
    } finally {
      setLoading(false);
    }
  };

  // Load news from Supabase
  const loadNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Convert database format to app format
        const formattedNews = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          content: item.content,
          image: item.image,
          date: item.date
        }));
        setNews(formattedNews);
      } else {
        // If no data, use mock data as fallback
        setNews(mockData.news);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      setNews(mockData.news);
    }
  };

  // Load server status from Supabase
  const loadServerStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('server_status')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        // If record doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('server_status')
            .insert([{
              id: 1,
              status: 'Online',
              players: '0',
              max_players: '500',
              version: '1.20.4',
              uptime: '99.9%'
            }])
            .select()
            .single();
          
          if (insertError) throw insertError;
          
          if (newData) {
            setServerStatus({
              status: newData.status,
              players: newData.players,
              maxPlayers: newData.max_players,
              version: newData.version,
              uptime: newData.uptime
            });
          }
          return;
        }
        throw error;
      }
      
      if (data) {
        setServerStatus({
          status: data.status,
          players: data.players,
          maxPlayers: data.max_players,
          version: data.version,
          uptime: data.uptime
        });
      }
    } catch (error) {
      console.error('Error loading server status:', error);
      // Fallback to default values
      setServerStatus({
        status: 'Online',
        players: '0',
        maxPlayers: '500',
        version: '1.20.4',
        uptime: '99.9%'
      });
    }
  };

  // Load contacts from Supabase (Admin only)
  const loadContacts = async () => {
    if (!isAuthenticated) return;
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setContacts(data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  // Load site settings from Supabase
  const loadSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        // If record doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('site_settings')
            .insert([{
              id: 1,
              server_ip: 'play.buildnchill.com',
              server_version: '1.20.4',
              contact_email: 'contact@buildnchill.com',
              contact_phone: '+1 (234) 567-890',
              discord_url: 'https://discord.gg/buildnchill',
              site_title: 'BuildnChill',
              maintenance_mode: false
            }])
            .select()
            .single();
          
          if (insertError) throw insertError;
          
          if (newData) {
            setSiteSettings({
              server_ip: newData.server_ip,
              server_version: newData.server_version,
              contact_email: newData.contact_email,
              contact_phone: newData.contact_phone,
              discord_url: newData.discord_url,
              site_title: newData.site_title,
              maintenance_mode: newData.maintenance_mode
            });
          }
          return;
        }
        throw error;
      }
      
      if (data) {
        setSiteSettings({
          server_ip: data.server_ip,
          server_version: data.server_version,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          discord_url: data.discord_url,
          site_title: data.site_title,
          maintenance_mode: data.maintenance_mode
        });
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
    }
  };

  // Update site settings
  const updateSiteSettings = async (newSettings) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          ...newSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) throw error;
      
      setSiteSettings(prev => ({ ...prev, ...newSettings }));
      
      return true;
    } catch (error) {
      console.error('Error updating site settings:', error);
      alert('Lỗi khi cập nhật cài đặt: ' + error.message);
      return false;
    }
  };

  // News operations
  const addNews = async (newPost) => {
    try {
      const { data, error } = await supabase
        .from('news')
        .insert([{
          title: newPost.title,
          description: newPost.description,
          content: newPost.content,
          image: newPost.image,
          date: newPost.date
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      const formattedPost = {
        id: data.id,
        title: data.title,
        description: data.description,
        content: data.content,
        image: data.image,
        date: data.date
      };
      setNews(prev => [formattedPost, ...prev].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      ));
      
      return true;
    } catch (error) {
      console.error('Error adding news:', error);
      alert('Lỗi khi thêm bài viết: ' + error.message);
      return false;
    }
  };

  const updateNews = async (postId, updatedPost) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({
          title: updatedPost.title,
          description: updatedPost.description,
          content: updatedPost.content,
          image: updatedPost.image,
          date: updatedPost.date,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;
      
      // Update local state
      setNews(prev => prev.map(post => 
        post.id === postId ? updatedPost : post
      ).sort((a, b) => new Date(b.date) - new Date(a.date)));
      
      return true;
    } catch (error) {
      console.error('Error updating news:', error);
      alert('Lỗi khi cập nhật bài viết: ' + error.message);
      return false;
    }
  };

  const deleteNews = async (postId) => {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      // Update local state
      setNews(prev => prev.filter(post => post.id !== postId));
      
      return true;
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Lỗi khi xóa bài viết: ' + error.message);
      return false;
    }
  };

  // Server status operations
  const updateServerStatus = async (status) => {
    try {
      const { error } = await supabase
        .from('server_status')
        .update({
          status: status.status,
          players: status.players,
          max_players: status.maxPlayers,
          version: status.version,
          uptime: status.uptime,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) throw error;
      
      // Update local state
      setServerStatus(prev => ({ ...prev, ...status }));
      
      return true;
    } catch (error) {
      console.error('Error updating server status:', error);
      alert('Lỗi khi cập nhật trạng thái server: ' + error.message);
      return false;
    }
  };

  // Contact operations
  const submitContact = async (contactData) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          ign: contactData.ign,
          email: contactData.email,
          phone: contactData.phone || null,
          subject: contactData.subject,
          message: contactData.message
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Reload contacts if admin is viewing
      if (isAuthenticated) {
        loadContacts();
      }
      
      return true;
    } catch (error) {
      console.error('Error submitting contact:', error);
      alert('Lỗi khi gửi liên hệ: ' + error.message);
      return false;
    }
  };

  const markContactAsRead = async (contactId) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ read: true })
        .eq('id', contactId);

      if (error) throw error;
      
      setContacts(prev => prev.map(contact =>
        contact.id === contactId ? { ...contact, read: true } : contact
      ));
      
      return true;
    } catch (error) {
      console.error('Error marking contact as read:', error);
      return false;
    }
  };

  const deleteContact = async (contactId) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Lỗi khi xóa liên hệ: ' + error.message);
      return false;
    }
  };

  // Authentication
  const login = async (username, password) => {
    // Simple authentication (you can enhance this later)
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      // Load contacts when admin logs in
      await loadContacts();
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
  };

  const value = {
    // Data
    news,
    serverStatus,
    contacts,
    siteSettings,
    loading,
    
    // News operations
    addNews,
    updateNews,
    deleteNews,
    
    // Server status operations
    updateServerStatus,
    
    // Site settings operations
    updateSiteSettings,
    
    // Contact operations
    submitContact,
    markContactAsRead,
    deleteContact,
    
    // Authentication
    isAuthenticated,
    login,
    logout
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

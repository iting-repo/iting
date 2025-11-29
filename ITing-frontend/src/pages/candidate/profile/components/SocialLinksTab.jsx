import React, { useState } from 'react';
import { FaPlusCircle, FaTimes, FaFacebook, FaTwitter, FaLinkedin, FaYoutube, FaInstagram, FaGlobe } from 'react-icons/fa';

const SocialLinksTab = () => {
  const [socials, setSocials] = useState([
    { id: 1, platform: 'Facebook', url: '' },
    { id: 2, platform: 'Twitter', url: '' },
    { id: 3, platform: 'Instagram', url: '' },
    { id: 4, platform: 'Youtube', url: '' },
  ]);

  const addSocial = () => {
    setSocials([...socials, { id: Date.now(), platform: 'Facebook', url: '' }]);
  };

  const removeSocial = (id) => {
    setSocials(socials.filter(item => item.id !== id));
  };

  const getIcon = (platform) => {
      switch(platform) {
          case 'Facebook': return <FaFacebook className="text-blue-600" />;
          case 'Instagram': return <FaInstagram className="text-pink-600" />;
          case 'Youtube': return <FaYoutube className="text-red-600" />;
          case 'Twitter': return <FaTwitter className="text-sky-400" />;
          case 'Linkedin': return <FaLinkedin className="text-blue-700" />;
          default: return <FaGlobe className="text-gray-400" />;
      }
  }

  return (
    <div className="max-w-4xl">
      <div className="space-y-6 mb-8">
        {socials.map((item, index) => (
          <div key={item.id}>
             <label className="block text-gray-700 text-sm font-medium mb-1">{item.platform}</label>
             <div className="flex gap-4">
                {/* Dropdown Select */}
                <div className="relative w-48">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-lg">
                        {getIcon(item.platform)}
                    </div>
                    <select 
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6]"
                        value={item.platform}
                        onChange={(e) => {
                            const newSocials = [...socials];
                            newSocials[index].platform = e.target.value;
                            setSocials(newSocials);
                        }}
                    >
                        <option value="Facebook">Facebook</option>
                        <option value="Twitter">Twitter</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Youtube">Youtube</option>
                        <option value="Linkedin">Linkedin</option>
                    </select>
                </div>

                {/* Input URL */}
                <div className="flex-1">
                    <input 
                        type="text" 
                        placeholder="Profile link/url..." 
                        value={item.url}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
                        onChange={(e) => {
                            const newSocials = [...socials];
                            newSocials[index].url = e.target.value;
                            setSocials(newSocials);
                        }}
                    />
                </div>

                {/* Delete Button */}
                <button 
                    onClick={() => removeSocial(item.id)}
                    className="w-12 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
                >
                    <FaTimes />
                </button>
             </div>
          </div>
        ))}
      </div>

      <button 
        onClick={addSocial}
        className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors mb-8"
      >
        <FaPlusCircle /> Thêm Link Mạng Xã Hội
      </button>

      <button className="bg-[#3AB4E6] text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-500 transition-colors">
        Lưu Thay Đổi
      </button>
    </div>
  );
};

export default SocialLinksTab;
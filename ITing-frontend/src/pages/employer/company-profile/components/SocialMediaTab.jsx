import React, { useState } from 'react';
import { FaPlusCircle, FaTimes } from 'react-icons/fa';
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube, FaInstagram } from 'react-icons/fa';

const SocialMediaTab = () => {
  // Mock state ban đầu
  const [socials, setSocials] = useState([
    { id: 1, platform: 'Facebook', url: '' },
    { id: 2, platform: 'Instagram', url: '' },
    { id: 3, platform: 'Youtube', url: '' },
  ]);

  const addSocial = () => {
    setSocials([...socials, { id: Date.now(), platform: 'Facebook', url: '' }]);
  };

  const removeSocial = (id) => {
    setSocials(socials.filter(item => item.id !== id));
  };

  // Helper để lấy icon dựa trên platform
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
             <label className="block text-gray-700 text-sm font-medium mb-1">Link {index + 1}</label>
             <div className="flex gap-4">
                {/* Dropdown Select Platform */}
                <div className="relative w-48">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
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
                        <option value="Instagram">Instagram</option>
                        <option value="Youtube">Youtube</option>
                        <option value="Twitter">Twitter</option>
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
                    className="w-12 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-red-100 hover:text-red-500 transition-colors"
                >
                    <FaTimes />
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button 
        onClick={addSocial}
        className="w-full bg-gray-50 border border-dashed border-gray-300 text-gray-600 font-medium py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors mb-8"
      >
        <FaPlusCircle /> Thêm trang mạng xã hội
      </button>

      {/* Save Button */}
      <button className="bg-[#1967D2] text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
        Lưu Thay Đổi
      </button>
    </div>
  );
};

export default SocialMediaTab;
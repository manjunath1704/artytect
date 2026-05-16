"use client";

import React from "react";

export default function ContactMap() {
  return (
    <div className="overflow-hidden rounded-[32px] shadow-xl">
          <div className="p-0">
            <div className="relative h-[400px] w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4699.590912403948!2d77.69873369999999!3d12.8873511!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae13c27915ca3d%3A0x56aa61ea692e9005!2sStudio%20Haritham%20%7C%20Pottery%20and%20Art%20Space!5e1!3m2!1sen!2sin!4v1778954655421!5m2!1sen!2sin"
                className="absolute inset-0 h-full w-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
  );
}
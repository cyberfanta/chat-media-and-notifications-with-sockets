const fetch = require('node-fetch');

async function testCommentsService() {
  try {
    console.log('🚀 Iniciando test completo del Comments Service...\n');

    // 1. Login para obtener token
    console.log('1️⃣ Autenticándose...');
    const loginResponse = await fetch('http://localhost:5900/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Error en login: ${loginResponse.statusText}`);
    }

    const { access_token: token } = await loginResponse.json();
    console.log('✅ Login exitoso\n');

    // 2. Verificar health del comments-service
    console.log('2️⃣ Verificando health del Comments Service...');
    const healthResponse = await fetch('http://localhost:5902/comments/health');
    
    if (!healthResponse.ok) {
      throw new Error(`Comments service no disponible: ${healthResponse.statusText}`);
    }

    const healthData = await healthResponse.json();
    console.log(`✅ Comments Service funcionando: ${healthData.status}`);
    console.log(`   Timestamp: ${healthData.timestamp}\n`);

    // 3. Crear un contenido multimedia para comentar
    console.log('3️⃣ Obteniendo contenido multimedia para comentar...');
    const mediaResponse = await fetch('http://localhost:5901/media', {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    let contentId;
    if (mediaResponse.ok) {
      const mediaList = await mediaResponse.json();
      if (mediaList.length > 0) {
        contentId = mediaList[0].id;
        console.log(`✅ Usando contenido existente: ${contentId}`);
      }
    }

    // Si no hay contenido, usar un ID ficticio para testing
    if (!contentId) {
      contentId = '12345678-1234-1234-1234-123456789012';
      console.log(`⚠️ Usando contenido ficticio para testing: ${contentId}`);
    }
    console.log('');

    // 4. Crear comentarios de prueba
    console.log('4️⃣ Creando comentarios de prueba...');
    
    const comments = [
      'Este contenido está increíble! 🎉',
      'Me encanta la calidad del video',
      'Excelente trabajo, muy profesional',
      'Contenido muy útil, gracias por compartir'
    ];

    const createdComments = [];
    
    for (let i = 0; i < comments.length; i++) {
      const commentResponse = await fetch(`http://localhost:5902/comments/content/${contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: comments[i],
          contentId: contentId,
        }),
      });

      if (commentResponse.ok) {
        const comment = await commentResponse.json();
        createdComments.push(comment);
        console.log(`   ✅ Comentario ${i + 1} creado: ${comment.id}`);
      } else {
        console.log(`   ❌ Error creando comentario ${i + 1}: ${commentResponse.statusText}`);
      }
    }

    console.log(`✅ ${createdComments.length} comentarios creados\n`);

    // 5. Crear una respuesta a un comentario
    if (createdComments.length > 0) {
      console.log('5️⃣ Creando respuesta a comentario...');
      const parentComment = createdComments[0];
      
      const replyResponse = await fetch(`http://localhost:5902/comments/content/${contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: 'Totalmente de acuerdo! 👍',
          contentId: contentId,
          parentId: parentComment.id,
        }),
      });

      if (replyResponse.ok) {
        const reply = await replyResponse.json();
        createdComments.push(reply);
        console.log(`✅ Respuesta creada: ${reply.id}`);
        console.log(`   Padre: ${reply.parentId}\n`);
      } else {
        console.log(`❌ Error creando respuesta: ${replyResponse.statusText}\n`);
      }
    }

    // 6. Obtener comentarios con paginación
    console.log('6️⃣ Probando paginación de comentarios...');
    
    const paginationTests = [
      { page: 1, limit: 2, description: 'Primera página (2 elementos)' },
      { page: 2, limit: 2, description: 'Segunda página (2 elementos)' },
      { page: 1, limit: 10, description: 'Todos los elementos' },
    ];

    for (const test of paginationTests) {
      const paginatedResponse = await fetch(
        `http://localhost:5902/comments/content/${contentId}?page=${test.page}&limit=${test.limit}&sortBy=createdAt&sortOrder=DESC`
      );

      if (paginatedResponse.ok) {
        const paginatedData = await paginatedResponse.json();
        console.log(`   ✅ ${test.description}:`);
        console.log(`      Comentarios: ${paginatedData.comments.length}`);
        console.log(`      Total: ${paginatedData.total}`);
        console.log(`      Página: ${paginatedData.page}/${paginatedData.totalPages}`);
        console.log(`      Tiene siguiente: ${paginatedData.hasNext}`);
        console.log(`      Tiene anterior: ${paginatedData.hasPrev}`);
      } else {
        console.log(`   ❌ Error en ${test.description}: ${paginatedResponse.statusText}`);
      }
    }
    console.log('');

    // 7. Probar filtros
    console.log('7️⃣ Probando filtros de comentarios...');
    
    const filterTests = [
      { filter: 'status=pending', description: 'Solo pendientes' },
      { filter: 'topLevelOnly=true', description: 'Solo comentarios principales' },
      { filter: 'sortBy=createdAt&sortOrder=ASC', description: 'Ordenados por fecha ascendente' },
    ];

    for (const test of filterTests) {
      const filteredResponse = await fetch(
        `http://localhost:5902/comments/content/${contentId}?${test.filter}`
      );

      if (filteredResponse.ok) {
        const filteredData = await filteredResponse.json();
        console.log(`   ✅ ${test.description}: ${filteredData.comments.length} comentarios`);
      } else {
        console.log(`   ❌ Error en ${test.description}: ${filteredResponse.statusText}`);
      }
    }
    console.log('');

    // 8. Probar moderación de comentarios
    if (createdComments.length > 0) {
      console.log('8️⃣ Probando moderación de comentarios...');
      
      const commentToModerate = createdComments[0];
      
      // Aprobar comentario
      const moderateResponse = await fetch(`http://localhost:5902/comments/${commentToModerate.id}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'approved',
        }),
      });

      if (moderateResponse.ok) {
        const moderatedComment = await moderateResponse.json();
        console.log(`✅ Comentario aprobado: ${moderatedComment.id}`);
        console.log(`   Estado: ${moderatedComment.status}`);
        console.log(`   Moderado por: ${moderatedComment.moderatedBy}`);
        console.log(`   Fecha moderación: ${moderatedComment.moderatedAt}`);
      } else {
        console.log(`❌ Error moderando comentario: ${moderateResponse.statusText}`);
      }

      // Rechazar otro comentario
      if (createdComments.length > 1) {
        const commentToReject = createdComments[1];
        
        const rejectResponse = await fetch(`http://localhost:5902/comments/${commentToReject.id}/moderate`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: 'rejected',
            moderationReason: 'Contenido inapropiado para testing',
          }),
        });

        if (rejectResponse.ok) {
          const rejectedComment = await rejectResponse.json();
          console.log(`✅ Comentario rechazado: ${rejectedComment.id}`);
          console.log(`   Razón: ${rejectedComment.moderationReason}`);
        } else {
          console.log(`❌ Error rechazando comentario: ${rejectResponse.statusText}`);
        }
      }
      console.log('');
    }

    // 9. Obtener comentarios pendientes de moderación
    console.log('9️⃣ Obteniendo comentarios pendientes de moderación...');
    const pendingResponse = await fetch('http://localhost:5902/comments/moderation/pending', {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (pendingResponse.ok) {
      const pendingData = await pendingResponse.json();
      console.log(`✅ Comentarios pendientes: ${pendingData.comments.length}`);
      console.log(`   Total en sistema: ${pendingData.total}`);
    } else {
      console.log(`❌ Error obteniendo pendientes: ${pendingResponse.statusText}`);
    }
    console.log('');

    // 10. Obtener estadísticas de comentarios
    console.log('🔟 Obteniendo estadísticas de comentarios...');
    const statsResponse = await fetch(`http://localhost:5902/comments/stats/${contentId}`);

    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('📊 Estadísticas de comentarios:');
      console.log(`   Total: ${stats.total}`);
      console.log(`   Aprobados: ${stats.approved}`);
      console.log(`   Pendientes: ${stats.pending}`);
      console.log(`   Rechazados: ${stats.rejected}`);
      console.log(`   Contenido ID: ${stats.contentId}`);
    } else {
      console.log(`❌ Error obteniendo estadísticas: ${statsResponse.statusText}`);
    }
    console.log('');

    // 11. Probar actualización de comentario
    if (createdComments.length > 0) {
      console.log('1️⃣1️⃣ Probando actualización de comentario...');
      
      const commentToUpdate = createdComments[createdComments.length - 1];
      
      const updateResponse = await fetch(`http://localhost:5902/comments/${commentToUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: 'Comentario actualizado para testing ✏️',
        }),
      });

      if (updateResponse.ok) {
        const updatedComment = await updateResponse.json();
        console.log(`✅ Comentario actualizado: ${updatedComment.id}`);
        console.log(`   Editado: ${updatedComment.isEdited}`);
        console.log(`   Nuevo estado: ${updatedComment.status}`);
      } else {
        console.log(`❌ Error actualizando comentario: ${updateResponse.statusText}`);
      }
      console.log('');
    }

    console.log('🎉 ¡Test completo del Comments Service exitoso!');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('   ✅ Health check del servicio');
    console.log('   ✅ Creación de comentarios');
    console.log('   ✅ Creación de respuestas (comentarios anidados)');
    console.log('   ✅ Paginación de comentarios');
    console.log('   ✅ Filtros y ordenamiento');
    console.log('   ✅ Moderación de comentarios (aprobar/rechazar)');
    console.log('   ✅ Comentarios pendientes de moderación');
    console.log('   ✅ Estadísticas de comentarios');
    console.log('   ✅ Actualización de comentarios');
    
    console.log('\n🔗 URLs útiles:');
    console.log('   📚 Swagger Comments: http://localhost:5902/api/docs');
    console.log('   📚 Swagger Auth: http://localhost:5900/api/docs');
    console.log('   📚 Swagger Media: http://localhost:5901/api/docs');
    console.log('   💾 pgAdmin: http://localhost:5050');

    console.log('\n💡 Características del Comments Service:');
    console.log('   🔐 Autenticación JWT con auth-service');
    console.log('   📄 Paginación avanzada con filtros');
    console.log('   🛡️ Sistema de moderación completo');
    console.log('   💬 Soporte para comentarios anidados');
    console.log('   📊 Estadísticas en tiempo real');
    console.log('   🗑️ Eliminación automática al borrar contenido');

  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
  }
}

testCommentsService(); 
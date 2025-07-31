import Task from '#models/task';
import User from '#models/user';
import { taskPatchValidator, taskValidator } from '#validators/task';
import type { HttpContext } from '@adonisjs/core/http'

export default class TasksController {
  /**
   * @create
   * @requestBody { "title": "string", "description": "string", "status": "string" }
   * @responseBody 201 - <Task>
   */
  public async create({ request, response }: HttpContext) {
    const data = await request.all();
    const payload = await taskValidator.validate(data);
    const user = (request as any).user as User;
    const task = await Task.create({...payload, userId: user.id });
    return response.created(task);
  }

  /**
   * @show
   * @responseBody 200 - <Task>
   */
  public async show({ request, response }: HttpContext) {
    const user = (request as any).user as User;
    const taskId = request.param('id');
    const task = await Task.query().where('id', taskId).where('userId', user.id).first();

    if (!task) {
      return response.notFound({ message: 'Task not found' });
    }

    return response.ok(task);
  }

  /**
   * @index
   * @responseBody 200 - <Task[]>
   */
  public async index({ request, response }: HttpContext) {
    const user = (request as any).user as User;
    const tasks = await Task.query().where('userId', user.id)
    return response.ok(tasks);
  }

  /**
   * @destroy
   * @responseBody 204 - No Content
   */
  public async destroy({ request, response }: HttpContext) {
    const user = (request as any).user as User;
    const taskId = request.param('id');
    const task = await Task.query().where('id', taskId).where('userId', user.id).first();

    if (!task) {
        return response.notFound({ message: 'Task not found' });
    }

    await task.delete();
    return response.noContent();
  }

  /**
   * @update
   * @requestBody {"title": "string", "description": "string", "status": "string" }
   * @responseBody 200 - <Task>
   */
  public async update({ request, response }: HttpContext) {
    const user = (request as any).user as User;
    const taskId = request.param('id');
    const data = await request.all();
    const payload = await taskValidator.validate(data);
    const task = await Task.query().where('id', taskId).where('userId', user.id).first();

    if (!task) {
      return response.notFound({ message: 'Task not found' });
    }

    task.merge(payload);
    await task.save();
    return response.ok(task);
  }

  /**
   * @patch
   * @requestBody {"title": "string", "description": "string", "status": "string" }
   * @responseBody 200 - <Task>
   */
  public async patch({ request, response }: HttpContext) {
    const user = (request as any).user as User;
    const taskId = request.param('id');
    const data = await request.all();
    const payload = await taskPatchValidator.validate(data);
    const task = await Task.query().where('id', taskId).where('userId', user.id).first();

    if (!task) {
      return response.notFound({ message: 'Task not found' });
    }

    task.merge(payload);
    await task.save();
    return response.ok(task);
  }

}